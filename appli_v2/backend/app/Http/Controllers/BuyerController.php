<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BuyerController extends Controller
{
    /**
     * Get buyer favorites.
     */
    public function getFavorites($id)
    {
        $favorites = DB::table('favoris')
            ->join('produit', 'produit.id_produit', '=', 'favoris.id_produit')
            ->leftJoin('categorie', 'categorie.id_categorie', '=', 'produit.id_categorie')
            ->where('favoris.id_user', $id)
            ->select('produit.*', 'categorie.nom_categorie as categorie_nom')
            ->get();

        return response()->json($favorites);
    }

    /**
     * Toggle favorite status.
     */
    public function toggleFavorite(Request $request, $id)
    {
        $request->validate([
            'id_produit' => 'required|integer'
        ]);

        $exists = DB::table('favoris')
            ->where('id_user', $id)
            ->where('id_produit', $request->id_produit)
            ->first();

        if ($exists) {
            DB::table('favoris')->where('id', $exists->id)->delete();
            return response()->json(['message' => 'Retiré des favoris', 'status' => 'removed']);
        } else {
            DB::table('favoris')->insert([
                'id_user' => $id,
                'id_produit' => $request->id_produit,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            return response()->json(['message' => 'Ajouté aux favoris', 'status' => 'added']);
        }
    }

    /**
     * Get buyer notifications.
     */
    public function getNotifications($id)
    {
        $notifications = DB::table('notifications')
            ->where('id_user', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead($id, $notifId)
    {
        DB::table('notifications')
            ->where('id_user', $id)
            ->where('id', $notifId)
            ->update(['est_lue' => true]);

        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    /**
     * Get buyer orders (groupées par id_commande, colonnes BDD : id_acheteur, montant_total).
     */
    public function getOrders($id)
    {
        $photoSub = '(SELECT pp.chemin FROM produit_photo pp WHERE pp.id_produit = produit.id_produit ORDER BY pp.id_photo ASC LIMIT 1)';

        $rows = DB::table('commande')
            ->join('commande_produit', 'commande.id_commande', '=', 'commande_produit.id_commande')
            ->join('produit', 'produit.id_produit', '=', 'commande_produit.id_produit')
            ->join('vendeur', 'vendeur.id_user', '=', 'produit.id_vendeur')
            ->where('commande.id_acheteur', (int) $id)
            ->select(
                'commande.id_commande',
                'commande.date_commande',
                'commande.statut',
                'commande.montant_total',
                'commande_produit.id_produit',
                'commande_produit.quantite',
                'commande_produit.prix_unitaire',
                'commande_produit.statut as statut_ligne',
                'produit.titre',
                'vendeur.nom_boutique',
                DB::raw($photoSub . ' as photo')
            )
            ->orderBy('commande.date_commande', 'desc')
            ->get();

        $grouped = [];
        foreach ($rows as $row) {
            $cid = (int) $row->id_commande;
            if (! isset($grouped[$cid])) {
                $grouped[$cid] = [
                    'id'              => $cid,
                    'id_commande'     => $cid,
                    'numero'          => 'GLD-' . $cid,
                    'date_commande'   => $row->date_commande,
                    'created_at'      => $row->date_commande,
                    'statut'          => strtolower((string) $row->statut),
                    'montant_total'   => (float) $row->montant_total,
                    'total'           => (float) $row->montant_total,
                    'produits'        => [],
                    '_boutiques'      => [],
                ];
            }
            $grouped[$cid]['_boutiques'][$row->nom_boutique] = true;
            $grouped[$cid]['produits'][] = [
                'id_produit' => (int) $row->id_produit,
                'nom'        => $row->titre,
                'name'       => $row->titre,
                'quantite'   => (int) $row->quantite,
                'prix'       => (float) $row->prix_unitaire,
                'statut_ligne' => $row->statut_ligne,
                'photo'      => $row->photo
            ];
        }

        foreach ($grouped as &$o) {
            $shops = array_keys($o['_boutiques']);
            $o['vendeur_nom'] = count($shops) > 1 ? 'Plusieurs vendeurs' : ($shops[0] ?? 'Marketplace');
            unset($o['_boutiques']);
        }
        unset($o);

        return response()->json(array_values($grouped));
    }
}
