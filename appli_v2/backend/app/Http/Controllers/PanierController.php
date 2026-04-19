<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PanierController extends Controller
{
    /**
     * Récupère le panier d'un acheteur avec les détails des produits.
     */
    public function index($id_acheteur)
    {
        // Sous-requête pour la 1ère photo (évite un JOIN produit_photo fragile sous MariaDB)
        $photoSub = '(SELECT pp.chemin FROM produit_photo pp WHERE pp.id_produit = panier_produit.id_produit ORDER BY pp.id_photo ASC LIMIT 1)';

        $items = DB::table('panier')
            ->join('panier_produit', 'panier.id_panier', '=', 'panier_produit.id_panier')
            ->join('produit', 'panier_produit.id_produit', '=', 'produit.id_produit')
            ->leftJoin('categorie', 'produit.id_categorie', '=', 'categorie.id_categorie')
            ->where('panier.id_acheteur', (int) $id_acheteur)
            ->select(
                'panier.id_panier',
                'panier_produit.id_produit',
                'panier_produit.quantite',
                'panier_produit.prix_unitaire',
                'produit.titre',
                'produit.artiste',
                'categorie.nom as categorie_nom',
                DB::raw($photoSub . ' as photo')
            )
            ->get();

        return response()->json($items);
    }

    /**
     * Supprime l’en-tête panier si plus aucune ligne dans panier_produit.
     */
    private function deletePanierIfEmpty(int $id_panier): void
    {
        $remaining = DB::table('panier_produit')->where('id_panier', $id_panier)->count();
        if ($remaining === 0) {
            DB::table('panier')->where('id_panier', $id_panier)->delete();
        }
    }

    /**
     * Ajoute un produit au panier. Si déjà présent, renvoie un message spécifique.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_acheteur'   => 'required|integer',
            'id_produit'    => 'required|integer',
            'prix_unitaire' => 'required|numeric',
            'quantite'      => 'sometimes|integer|min:1|max:99'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $id_acheteur = $request->id_acheteur;
        $id_produit  = $request->id_produit;
        $qtyAdd      = (int) $request->input('quantite', 1);
        if ($qtyAdd < 1) {
            $qtyAdd = 1;
        }
        if ($qtyAdd > 99) {
            $qtyAdd = 99;
        }

        // 1. Trouver ou créer le panier (header) de façon unique
        $panier = DB::table('panier')->where('id_acheteur', $id_acheteur)->first();
        if (!$panier) {
            try {
                $id_panier = DB::table('panier')->insertGetId([
                    'id_acheteur' => $id_acheteur
                ]);
            } catch (\Exception $e) {
                // Au cas où une insertion parallèle aurait eu lieu
                $panier = DB::table('panier')->where('id_acheteur', $id_acheteur)->first();
                $id_panier = $panier->id_panier;
            }
        } else {
            $id_panier = $panier->id_panier;
        }

        // 2. Vérifier si le produit est déjà dans panier_produit
        $exists = DB::table('panier_produit')
            ->where('id_panier', $id_panier)
            ->where('id_produit', $id_produit)
            ->first();

        if ($exists) {
            DB::table('panier_produit')
                ->where('id_panier', $id_panier)
                ->where('id_produit', $id_produit)
                ->update(['quantite' => $exists->quantite + $qtyAdd]);

            return response()->json([
                'message' => 'Quantité mise à jour dans votre panier.',
                'status'  => 'qty_incremented'
            ], 200);
        }

        // 3. Ajouter à panier_produit
        DB::table('panier_produit')->insert([
            'id_panier'     => $id_panier,
            'id_produit'    => $id_produit,
            'quantite'      => $qtyAdd,
            'prix_unitaire' => $request->prix_unitaire
        ]);

        return response()->json([
            'message' => 'Produit ajouté au panier avec succès !',
            'status'  => 'added'
        ], 201);
    }

    /**
     * Modifie la quantité d'un article du panier (clé panier + produit, compatible BDD sans id_panier_produit).
     */
    public function update(Request $request, $id_panier, $id_produit)
    {
        $request->validate(['quantite' => 'required|integer|min:1']);

        DB::table('panier_produit')
            ->where('id_panier', $id_panier)
            ->where('id_produit', $id_produit)
            ->update(['quantite' => $request->quantite]);

        return response()->json(['message' => 'Quantité mise à jour']);
    }

    /**
     * Supprime un article du panier.
     */
    public function destroy($id_panier, $id_produit)
    {
        DB::table('panier_produit')
            ->where('id_panier', $id_panier)
            ->where('id_produit', $id_produit)
            ->delete();

        $this->deletePanierIfEmpty((int) $id_panier);

        return response()->json(['message' => 'Article retiré du panier']);
    }

    /**
     * Supprime un article du panier via l'ID de l'acheteur.
     */
    public function destroyByAcheteur($id_acheteur, $id_produit)
    {
        $panier = DB::table('panier')->where('id_acheteur', $id_acheteur)->first();
        if ($panier) {
            DB::table('panier_produit')
                ->where('id_panier', $panier->id_panier)
                ->where('id_produit', $id_produit)
                ->delete();
            
            $this->deletePanierIfEmpty((int) $panier->id_panier);
        }
        return response()->json(['message' => 'Article retiré']);
    }

    /**
     * Vide tout le panier d'un acheteur.
     */
    public function clear($id_acheteur)
    {
        $panier = DB::table('panier')->where('id_acheteur', $id_acheteur)->first();
        if ($panier) {
            DB::table('panier_produit')->where('id_panier', $panier->id_panier)->delete();
            DB::table('panier')->where('id_panier', $panier->id_panier)->delete();
        }
        return response()->json(['message' => 'Panier vidé']);
    }

    private function deletePanierIfEmpty($id_panier)
    {
        $count = DB::table('panier_produit')->where('id_panier', $id_panier)->count();
        if ($count === 0) {
            DB::table('panier')->where('id_panier', $id_panier)->delete();
        }
    }
}
