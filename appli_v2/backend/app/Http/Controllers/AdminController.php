<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get platform stats for the admin dashboard.
     */
    public function getStats()
    {
        $commissionRate = 0.08;
        $totalVolume = DB::table('commandes')
            ->where('statut', 'LIVREE')
            ->sum('total_ttc');
        
        $totalFees = $totalVolume * $commissionRate;

        $activeProducts = DB::table('produit')->where('statut', 'VALIDEE')->count();
        $pendingProducts = DB::table('annonce')->where('statut', 'EN_ATTENTE')->count();

        $sellersCount = DB::table('vendeur')->count();
        $buyersCount = DB::table('acheteur')->count();

        return response()->json([
            'platform_fees'    => (float)$totalFees,
            'active_products'  => (int)$activeProducts,
            'pending_products' => (int)$pendingProducts,
            'total_users'      => (int)($sellersCount + $buyersCount)
        ]);
    }

    /**
     * Get products awaiting validation.
     */
    public function getPendingProducts()
    {
        $products = DB::table('annonce')
            ->join('annonce_produit', 'annonce.id_annonce', '=', 'annonce_produit.id_annonce')
            ->join('produit', 'annonce_produit.id_produit', '=', 'produit.id_produit')
            ->where('annonce.statut', 'EN_ATTENTE')
            ->select('annonce.*', 'produit.prix', 'produit.titre', 'produit.id_vendeur')
            ->orderBy('annonce.date_soumission', 'desc')
            ->get();
            
        return response()->json($products);
    }

    /**
     * Get ALL platform users.
     */
    public function getUsers()
    {
        $users = DB::table('utilisateurs')
            ->leftJoin('vendeur', 'utilisateurs.id_user', '=', 'vendeur.id_user')
            ->select('utilisateurs.id_user', 'utilisateurs.nom', 'utilisateurs.prenom', 'utilisateurs.email', 'utilisateurs.role', 'vendeur.nom_boutique')
            ->orderBy('utilisateurs.role', 'asc')
            ->get();
        return response()->json($users);
    }

    /**
     * Get ALL platform sales.
     */
    public function getAllOrders()
    {
        $orders = DB::table('commandes')
            ->join('utilisateurs', 'commandes.id_acheteur', '=', 'utilisateurs.id_user')
            ->select('commandes.*', 'utilisateurs.nom as client_nom', 'utilisateurs.prenom as client_prenom')
            ->orderBy('commandes.date_commande', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Get recent catalogue additions.
     */
    public function getRecentCatalogue()
    {
        $products = DB::table('produit')
            ->orderBy('id_produit', 'desc')
            ->limit(10)
            ->get();
        return response()->json($products);
    }

    /**
     * Get notifications.
     */
    public function getNotifications()
    {
        $notifications = DB::table('notifications')
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get();
        
        return response()->json($notifications);
    }

    /**
     * Moderate a product.
     */
    public function moderateProduct(Request $request, $id)
    {
        $status = $request->action;
        
        DB::table('annonce')->where('id_annonce', $id)->update([
            'statut' => $status,
            'date_traitement' => now()
        ]);

        $link = DB::table('annonce_produit')->where('id_annonce', $id)->first();
        if ($link) {
            DB::table('produit')->where('id_produit', $link->id_produit)->update(['statut' => $status]);
        }

        return response()->json(['message' => "Statut mis à jour: {$status}"]);
    }

    /**
     * Delete user.
     */
    public function deleteUser($id)
    {
        DB::table('utilisateurs')->where('id_user', $id)->delete();
        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}
