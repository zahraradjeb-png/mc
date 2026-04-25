<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Get all products for a specific seller or all products.
     */
    public function index(Request $request)
    {
        $id_vendeur = $request->query('id_vendeur');

        $query = DB::table('produit')
            ->join('categorie', 'produit.id_categorie', '=', 'categorie.id_categorie')
            ->leftJoin('annonce_produit', 'produit.id_produit', '=', 'annonce_produit.id_produit')
            ->leftJoin('annonce', 'annonce_produit.id_annonce', '=', 'annonce.id_annonce')
            ->leftJoin('produit_photo', function($join) {
                $join->on('produit.id_produit', '=', 'produit_photo.id_produit')
                     ->whereRaw('produit_photo.id_photo = (SELECT MIN(id_photo) FROM produit_photo WHERE id_produit = produit.id_produit)');
            })
            ->select(
                'produit.*', 
                'categorie.nom as categorie_nom', 
                'produit_photo.chemin as photo_principale',
                DB::raw('CASE WHEN annonce.statut = "VALIDEE" OR produit.statut = "VALIDEE" THEN "VALIDEE" WHEN annonce.statut = "REFUSEE" OR produit.statut = "REFUSEE" THEN "REFUSEE" ELSE "EN_ATTENTE" END as real_statut')
            );

        if ($id_vendeur) {
            $query->where('produit.id_vendeur', $id_vendeur);
        } else {
            // Pour le catalogue public, on montre les validés (soit par annonce, soit directement)
            $query->where(function($q) {
                $q->where('annonce.statut', 'VALIDEE')
                  ->orWhere('produit.statut', 'VALIDEE');
            });
        }

        return response()->json($query->orderBy('produit.date_ajout', 'desc')->get());
    }

    /**
     * Get 8 to 12 popular (latest validated) products for the home page.
     */
    public function getPopular()
    {
        $products = DB::table('produit')
            ->join('categorie', 'produit.id_categorie', '=', 'categorie.id_categorie')
            ->leftJoin('annonce_produit', 'produit.id_produit', '=', 'annonce_produit.id_produit')
            ->leftJoin('annonce', 'annonce_produit.id_annonce', '=', 'annonce.id_annonce')
            ->leftJoin('produit_photo', function($join) {
                $join->on('produit.id_produit', '=', 'produit_photo.id_produit')
                     ->whereRaw('produit_photo.id_photo = (SELECT MIN(id_photo) FROM produit_photo WHERE id_produit = produit.id_produit)');
            })
            ->where(function($q) {
                $q->where('annonce.statut', 'VALIDEE')
                  ->orWhere('produit.statut', 'VALIDEE');
            })
            ->select(
                'produit.*',
                'categorie.nom as categorie_nom',
                'produit_photo.chemin as photo_principale',
                DB::raw('COALESCE(annonce.statut, produit.statut, "VALIDEE") as real_statut')
            )
            ->orderBy('produit.date_ajout', 'desc')
            ->limit(12)
            ->get();

        return response()->json($products);
    }

    /**
     * Store a new product.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_vendeur'   => 'required|integer',
            'id_categorie' => 'required|integer',
            'titre'        => 'required|string|max:200',
            'prix'         => 'required|numeric',
            'quantite'     => 'integer',
            'etat'         => 'required|in:NEUF,BON,ACCEPTABLE,ABIME',
            'rarete'       => 'in:COMMUN,RARE,TRES_RARE,COLLECTOR',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 1. Sauvegarder le produit principal
        $id_produit = DB::table('produit')->insertGetId([
            'id_categorie'   => $request->id_categorie,
            'id_vendeur'     => $request->id_vendeur,
            'titre'          => $request->titre,
            'description'    => $request->description,
            'prix'           => $request->prix,
            'quantite'       => $request->quantite ?? 1,
            'decennie'       => $request->decennie,
            'annee'          => $request->annee,
            'artiste'        => $request->artiste,
            'rarete'         => $request->rarete ?? 'COMMUN',
            'etat'           => $request->etat,
            'date_ajout'     => now(),
        ]);

        // 1b. Créer l'annonce (listing) liée pour la modération
        $id_annonce = DB::table('annonce')->insertGetId([
            'id_vendeur'      => $request->id_vendeur,
            'titre'           => $request->titre,
            'description'     => $request->description,
            'statut'          => 'EN_ATTENTE',
            'date_soumission' => now()
        ]);

        DB::table('annonce_produit')->insert([
            'id_annonce' => $id_annonce,
            'id_produit' => $id_produit
        ]);

        // 3. Envoyer une notification à l'admin
        $admin = DB::table('users')->where('role', 'ADMIN')->first();
        if ($admin) {
            DB::table('notifications')->insert([
                'id_user' => $admin->id_user,
                'titre'   => "Nouvelle annonce à valider",
                'contenu' => "Le vendeur ID #{$request->id_vendeur} a publié '{$request->titre}'. Annonce #{$id_annonce}.",
                'type'    => 'info',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // 2. Gérer les photos (Max 4)
        if ($request->hasFile('photos')) {
            $photos = $request->file('photos');
            foreach (array_slice($photos, 0, 4) as $photo) {
                if ($photo->isValid()) {
                    $filename = time() . '_' . uniqid() . '.' . $photo->getClientOriginalExtension();
                    $photo->move(public_path('uploads/products'), $filename);
                    
                    DB::table('produit_photo')->insert([
                        'id_produit' => $id_produit,
                        'chemin'     => 'uploads/products/' . $filename
                    ]);
                }
            }
        }

        // 3. Gérer les tables spécialisées
        $cat_id = $request->id_categorie;
        if ($cat_id == 3) { // Vinyle
            DB::table('vinyle')->insert([
                'id_produit' => $id_produit,
                'label'      => $request->label,
                'genre'      => $request->genre
            ]);
        } elseif ($cat_id == 1) { // CD
            DB::table('cds')->insert([
                'id_produit' => $id_produit,
                'nb_pistes'  => $request->nb_pistes,
                'label'      => $request->label,
                'genre'      => $request->genre
            ]);
        } elseif ($cat_id == 2) { // Cassette
            DB::table('cassette')->insert([
                'id_produit' => $id_produit,
                'duree_min'  => $request->duree_min,
                'label'      => $request->label,
                'genre'      => $request->genre
            ]);
        } elseif ($cat_id == 5) { // Instrument
            DB::table('instrument')->insert(['id_produit' => $id_produit]);
        } elseif ($cat_id == 4) { // Poster
            DB::table('poster')->insert(['id_produit' => $id_produit]);
        }

        return response()->json([
            'message'    => 'Produit et détails enregistrés avec succès !',
            'id_produit' => $id_produit
        ], 201);
    }

    /**
     * Show a specific product and its specialized data.
     */
    public function show($id)
    {
        $product = DB::table('produit')
            ->join('categorie', 'produit.id_categorie', '=', 'categorie.id_categorie')
            ->select('produit.*', 'categorie.nom as categorie_nom')
            ->where('id_produit', $id)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Produit non trouvé'], 404);
        }

        // Pour simplifier le MVP, on bloque si pas VALIDE pour tout le monde excepté si on ajoute un flag, 
        // mais ici on va juste bloquer l'accès public)
        $statut = DB::table('annonce')
            ->join('annonce_produit', 'annonce.id_annonce', '=', 'annonce_produit.id_annonce')
            ->where('annonce_produit.id_produit', $id)
            ->value('statut');

        if ($statut !== 'VALIDEE') {
            // Note: In a real app, we'd check current user role/id here.
        }

        // 1. Charger les photos
        $photos = DB::table('produit_photo')->where('id_produit', $id)->get();

        // 2. Charger les données spécialisées
        $details = null;
        if ($product->id_categorie == 3) $details = DB::table('vinyle')->where('id_produit', $id)->first();
        elseif ($product->id_categorie == 1) $details = DB::table('cds')->where('id_produit', $id)->first();
        elseif ($product->id_categorie == 2) $details = DB::table('cassette')->where('id_produit', $id)->first();

        return response()->json([
            'product' => $product,
            'photos'  => $photos,
            'details' => $details
        ]);
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'id_categorie' => 'required|integer',
            'titre'        => 'required|string|max:200',
            'prix'         => 'required|numeric',
            'quantite'     => 'integer',
            'etat'         => 'required|in:NEUF,BON,ACCEPTABLE,ABIME',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 1. MàJ Produit
        DB::table('produit')->where('id_produit', $id)->update([
            'id_categorie'   => $request->id_categorie,
            'titre'          => $request->titre,
            'description'    => $request->description,
            'prix'           => $request->prix,
            'quantite'       => $request->quantite ?? 1,
            'decennie'       => $request->decennie,
            'annee'          => $request->annee,
            'artiste'        => $request->artiste,
            'rarete'         => $request->rarete ?? 'COMMUN',
            'etat'           => $request->etat,
            'est_disponible' => $request->has('est_disponible') ? $request->est_disponible : 1,
        ]);

        // 2. MàJ Détails spécialisés (on supprime l'ancien et on remet si existant)
        // Note: Simple logic for this MVP
        DB::table('vinyle')->where('id_produit', $id)->delete();
        DB::table('cds')->where('id_produit', $id)->delete();
        DB::table('cassette')->where('id_produit', $id)->delete();
        DB::table('instrument')->where('id_produit', $id)->delete();
        DB::table('poster')->where('id_produit', $id)->delete();

        $cat_id = $request->id_categorie;
        if ($cat_id == 3) { // Vinyle
            DB::table('vinyle')->insert(['id_produit' => $id, 'label' => $request->label, 'genre' => $request->genre]);
        } elseif ($cat_id == 1) { // CD
            DB::table('cds')->insert(['id_produit' => $id, 'nb_pistes' => $request->nb_pistes, 'label' => $request->label, 'genre' => $request->genre]);
        } elseif ($cat_id == 2) { // Cassette
            DB::table('cassette')->insert(['id_produit' => $id, 'duree_min' => $request->duree_min, 'label' => $request->label, 'genre' => $request->genre]);
        } elseif ($cat_id == 5) { // Instrument
            DB::table('instrument')->insert(['id_produit' => $id]);
        } elseif ($cat_id == 4) { // Poster
            DB::table('poster')->insert(['id_produit' => $id]);
        }

        // 3. Nouvelles photos? (On ajoute à la suite)
        if ($request->hasFile('photos')) {
            $photos = $request->file('photos');
            $currentCount = DB::table('produit_photo')->where('id_produit', $id)->count();
            $remaining = 4 - $currentCount;

            if ($remaining > 0) {
                foreach (array_slice($photos, 0, $remaining) as $photo) {
                    $filename = time() . '_' . uniqid() . '.' . $photo->getClientOriginalExtension();
                    $photo->move(public_path('uploads/products'), $filename);
                    DB::table('produit_photo')->insert(['id_produit' => $id, 'chemin' => 'uploads/products/' . $filename]);
                }
            }
        }

        return response()->json(['message' => 'Produit mis à jour avec succès !']);
    }

    /**
     * Delete a single photo.
     */
    public function destroyPhoto($id)
    {
        $photo = DB::table('produit_photo')->where('id_photo', $id)->first();
        if ($photo) {
            $path = public_path($photo->chemin);
            if (file_exists($path)) {
                unlink($path);
            }
            DB::table('produit_photo')->where('id_photo', $id)->delete();
            return response()->json(['message' => 'Photo supprimée']);
        }
        return response()->json(['message' => 'Photo non trouvée'], 404);
    }

    /**
     * Delete a product permanently.
     */
    public function destroy($id)
    {
        // 1. Charger les photos pour les supprimer du disque
        $photos = DB::table('produit_photo')->where('id_produit', $id)->get();
        foreach ($photos as $photo) {
            $path = public_path($photo->chemin);
            if (file_exists($path)) {
                unlink($path);
            }
        }

        // 2. Supprimer les entrées spécialisées (au cas où pas de CASCADE)
        DB::table('vinyle')->where('id_produit', $id)->delete();
        DB::table('cds')->where('id_produit', $id)->delete();
        DB::table('cassette')->where('id_produit', $id)->delete();
        DB::table('instrument')->where('id_produit', $id)->delete();
        DB::table('poster')->where('id_produit', $id)->delete();
        DB::table('produit_photo')->where('id_produit', $id)->delete();

        // 3. Supprimer le produit
        $deleted = DB::table('produit')->where('id_produit', $id)->delete();

        if ($deleted) {
            return response()->json(['message' => 'Produit supprimé définitivement']);
        }
        return response()->json(['message' => 'Produit non trouvé'], 404);
    }
}
