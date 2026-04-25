<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Stats globales de la plateforme.
     */
    public function getStats()
    {
        $commissionRate  = 0.10;
        $totalVolume     = DB::table('commande')->where('statut', 'LIVREE')->sum('montant_total');
        $totalFees       = $totalVolume * $commissionRate;
        $activeProducts  = DB::table('produit')->where('statut', 'VALIDEE')->count();
        $refusedProducts = DB::table('produit')->where('statut', 'REFUSEE')->count();
        $pendingProducts = DB::table('produit')->where('statut', 'EN_ATTENTE')->count();
        $totalOrders     = DB::table('commande')->count();
        $totalUsers      = DB::table('users')->count();

        return response()->json([
            'platform_fees'    => (float)$totalFees,
            'active_products'  => (int)$activeProducts,
            'refused_products' => (int)$refusedProducts,
            'pending_products' => (int)$pendingProducts,
            'total_users'      => (int)$totalUsers,
            'total_orders'     => (int)$totalOrders
        ]);
    }

    /**
     * Produits filtrés par statut.
     */
    public function getProductsByStatus($statut)
    {
        $allowed = ['VALIDEE', 'REFUSEE', 'EN_ATTENTE'];
        if (!in_array($statut, $allowed)) {
            return response()->json(['message' => 'Statut invalide.'], 422);
        }

        $photoSub = '(SELECT pp.chemin FROM produit_photo pp WHERE pp.id_produit = produit.id_produit ORDER BY pp.id_photo ASC LIMIT 1)';

        $products = DB::table('produit')
            ->join('vendeur', 'produit.id_vendeur', '=', 'vendeur.id_user')
            ->join('users',   'vendeur.id_user',    '=', 'users.id_user')
            ->leftJoin('categorie', 'produit.id_categorie', '=', 'categorie.id_categorie')
            ->where('produit.statut', $statut)
            ->select(
                'produit.id_produit',
                'produit.titre',
                'produit.description',
                'produit.prix',
                'produit.etat',
                'produit.statut',
                'produit.date_ajout',
                'categorie.nom as categorie',
                'users.nom   as vendeur_nom',
                'users.prenom as vendeur_prenom',
                'vendeur.nom_boutique',
                DB::raw($photoSub . ' as photo')
            )
            ->orderBy('produit.date_ajout', 'desc')
            ->get();

        return response()->json($products);
    }

    /**
     * Produits en attente de modération.
     * produit.id_vendeur → vendeur.id_user → users.id_user
     */
    public function getPendingProducts()
    {
        $photoSub = '(SELECT pp.chemin FROM produit_photo pp WHERE pp.id_produit = produit.id_produit ORDER BY pp.id_photo ASC LIMIT 1)';

        $products = DB::table('produit')
            ->join('vendeur',   'produit.id_vendeur', '=', 'vendeur.id_user')
            ->join('users',     'vendeur.id_user',    '=', 'users.id_user')
            ->leftJoin('categorie', 'produit.id_categorie', '=', 'categorie.id_categorie')
            ->where('produit.statut', 'EN_ATTENTE')
            ->select(
                'produit.id_produit',
                'produit.titre',
                'produit.description',
                'produit.prix',
                'produit.etat',
                'produit.statut',
                'produit.date_ajout',
                'categorie.nom as categorie',
                'users.nom   as vendeur_nom',
                'users.prenom as vendeur_prenom',
                'vendeur.nom_boutique',
                DB::raw($photoSub . ' as photo')
            )
            ->orderBy('produit.date_ajout', 'desc')
            ->get();

        return response()->json($products);
    }

    /**
     * Liste de tous les utilisateurs.
     */
    public function getUsers()
    {
        $users = DB::table('users')
            ->leftJoin('vendeur', 'users.id_user', '=', 'vendeur.id_user')
            ->select(
                'users.id_user as id',
                'users.nom',
                'users.prenom',
                'users.email',
                'users.role',
                'users.created_at',
                'vendeur.nom_boutique'
            )
            ->orderBy('users.created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    /**
     * Toutes les commandes de la plateforme.
     */
    public function getAllOrders()
    {
        $vendeursSub = '(SELECT GROUP_CONCAT(DISTINCT v.nom_boutique SEPARATOR ", ") FROM commande_produit cp JOIN produit p ON cp.id_produit = p.id_produit JOIN vendeur v ON p.id_vendeur = v.id_user WHERE cp.id_commande = commande.id_commande)';

        $orders = DB::table('commande')
            ->join('users', 'commande.id_acheteur', '=', 'users.id_user')
            ->select(
                'commande.id_commande',
                'commande.id_acheteur',
                'commande.date_commande',
                'commande.statut',
                'commande.montant_total',
                'users.nom    as client_nom',
                'users.prenom as client_prenom',
                'users.email  as client_email',
                DB::raw($vendeursSub . ' as vendeurs')
            )
            ->orderBy('commande.date_commande', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Derniers produits validés avec photo.
     */
    public function getRecentCatalogue()
    {
        $photoSub = '(SELECT pp.chemin FROM produit_photo pp WHERE pp.id_produit = produit.id_produit ORDER BY pp.id_photo ASC LIMIT 1)';

        $products = DB::table('produit')
            ->join('vendeur', 'produit.id_vendeur', '=', 'vendeur.id_user')
            ->join('users',   'vendeur.id_user',    '=', 'users.id_user')
            ->leftJoin('categorie', 'produit.id_categorie', '=', 'categorie.id_categorie')
            ->where('produit.statut', 'VALIDEE')
            ->select(
                'produit.*',
                'categorie.nom as categorie',
                'users.nom    as vendeur_nom',
                'users.prenom as vendeur_prenom',
                'vendeur.nom_boutique',
                DB::raw($photoSub . ' as photo')
            )
            ->orderBy('produit.id_produit', 'desc')
            ->limit(12)
            ->get();

        return response()->json($products);
    }

    /**
     * Modérer un produit (VALIDEE / REFUSEE).
     */
    public function moderateProduct(Request $request, $id)
    {
        $status = $request->action; // VALIDEE ou REFUSEE

        DB::transaction(function () use ($id, $status) {
            // 1. Mettre à jour le produit
            DB::table('produit')->where('id_produit', $id)->update([
                'statut' => $status
            ]);

            // 2. Mettre à jour l'annonce liée (si elle existe)
            $annonceId = DB::table('annonce_produit')
                ->where('id_produit', $id)
                ->value('id_annonce');

            if ($annonceId) {
                DB::table('annonce')->where('id_annonce', $annonceId)->update([
                    'statut' => $status,
                    'date_traitement' => now()
                ]);
            }
        });

        return response()->json(['message' => "Statut mis à jour : {$status}"]);
    }

    /**
     * Supprimer un utilisateur.
     */
    public function deleteUser($id)
    {
        DB::table('users')->where('id_user', $id)->delete();
        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}
