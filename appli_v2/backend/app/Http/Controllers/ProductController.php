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
            // Sous-requête pour chopper la première photo
            ->leftJoin('produit_photo', function($join) {
                $join->on('produit.id_produit', '=', 'produit_photo.id_produit')
                     ->whereRaw('produit_photo.id_photo = (SELECT MIN(id_photo) FROM produit_photo WHERE id_produit = produit.id_produit)');
            })
            ->select('produit.*', 'categorie.nom as categorie_nom', 'produit_photo.chemin as photo_principale');

        if ($id_vendeur) {
            $query->where('id_vendeur', $id_vendeur);
        }

        return response()->json($query->orderBy('date_ajout', 'desc')->get());
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
            'est_disponible' => $request->has('est_disponible') ? $request->est_disponible : 1,
            'date_ajout'     => now(),
        ]);

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
