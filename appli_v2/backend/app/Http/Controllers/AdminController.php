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
        // 1. Total platform revenue (computed from vw_commandes)
        $commissionRate = 0.08;
        $totalVolume = DB::table('vw_commandes')
            ->where('statut', 'LIVREE')
            ->sum('montant_total');
        
        $totalFees = $totalVolume * $commissionRate;

        // 2. Active products vs Pending (from vw_produits and vw_annonces_en_attente)
        $activeProducts = DB::table('produit')->where('statut', 'VALIDEE')->count();
        $pendingProducts = DB::table('vw_annonces_en_attente')->count();

        // 3. User distribution
        $sellersCount = DB::table('vendeur')->count();
        $buyersCount = DB::table('acheteur')->count();

        // 4. Monthly volume (from vw_commandes)
        $monthlyVolume = DB::table('vw_commandes')
            ->where('statut', '!=', 'ANNULEE')
            ->whereMonth('date_commande', now()->month)
            ->sum('montant_total');

        return response()->json([
            'platform_fees'    => number_format($totalFees, 2, ',', ' '),
            'active_products'  => $activeProducts,
            'pending_products' => $pendingProducts,
            'sellers_count'    => $sellersCount,
            'buyers_count'     => $buyersCount,
            'monthly_volume'   => number_format($monthlyVolume, 2, ',', ' ')
        ]);
    }

    /**
     * Get products awaiting validation (using view).
     */
    public function getPendingProducts()
    {
        $products = DB::table('vw_annonces_en_attente')
            ->orderBy('date_soumission', 'desc')
            ->get();
        return response()->json($products);
    }

    /**
     * Get ALL platform users with roles and details.
     */
    public function getUsers()
    {
        $users = DB::table('users')
            ->leftJoin('vendeur', 'users.id_user', '=', 'vendeur.id_user')
            ->select('users.id_user', 'users.nom', 'users.prenom', 'users.email', 'users.role', 'vendeur.nom_boutique', 'vendeur.localisation')
            ->orderBy('users.role', 'asc')
            ->get();
        return response()->json($users);
    }

    /**
     * Get ALL platform sales (full history).
     */
    public function getAllSales()
    {
        $sales = DB::table('vw_commandes')
            ->orderBy('date_commande', 'desc')
            ->get();
        return response()->json($sales);
    }

    /**
     * Get recent platform sales (summary for dashboard if needed).
     */
    public function getRecentSales()
    {
        $sales = DB::table('vw_commandes')
            ->orderBy('date_commande', 'desc')
            ->limit(10)
            ->get();
        return response()->json($sales);
    }

    /**
     * Get recent catalogue additions (validated products).
     */
    public function getRecentCatalogue()
    {
        $products = DB::table('vw_produits')
            ->join('produit', 'vw_produits.id_produit', '=', 'produit.id_produit')
            ->select('vw_produits.*', 'produit.statut')
            ->orderBy('vw_produits.id_produit', 'desc')
            ->limit(10)
            ->get();
        return response()->json($products);
    }

    /**
     * Get unread notifications for the admin.
     */
    public function getNotifications()
    {
        // For current MVP, admin notifications are those with title involving "annonce" or similar
        // but we'll just fetch all notifications assigned to the admin user.
        // We assume the first ADMIN user is the one receiving them.
        $admin = DB::table('users')->where('role', 'ADMIN')->first();
        if (!$admin) return response()->json([]);

        $notifications = DB::table('notifications')
            ->where('id_user', $admin->id_user)
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get();
        
        return response()->json($notifications);
    }

    /**
     * Moderate a product (Approve or Reject via Annonce).
     */
    public function moderateProduct(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:VALIDEE,REFUSEE'
        ]);

        $status = $request->action;
        
        // Update Annonce
        DB::table('annonce')->where('id_annonce', $id)->update([
            'statut' => $status,
            'date_traitement' => now(),
            // 'id_admin' => auth()->id() // should be added if possible
        ]);

        // Find linked product to sync its status (for public catalogue visibility)
        $link = DB::table('annonce_produit')->where('id_annonce', $id)->first();
        if ($link) {
            DB::table('produit')->where('id_produit', $link->id_produit)->update([
                'statut' => $status
            ]);

            // Get owner for notification
            $product = DB::table('produit')->where('id_produit', $link->id_produit)->first();
            if ($product) {
                $msg = $status === 'VALIDEE' 
                    ? "Votre annonce '{$product->titre}' a été validée et est maintenant en ligne."
                    : "Votre annonce '{$product->titre}' a été refusée par l'administrateur.";
                
                DB::table('notifications')->insert([
                    'id_user' => $product->id_vendeur,
                    'titre'   => "Modération de l'annonce",
                    'contenu' => $msg,
                    'type'    => $status === 'VALIDEE' ? 'success' : 'warning',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        return response()->json(['message' => "Annonce mise à jour avec le statut: {$status}"]);
    }
}
