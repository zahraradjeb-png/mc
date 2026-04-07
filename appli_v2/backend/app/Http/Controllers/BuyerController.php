<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class BuyerController extends Controller
{
    public function __construct()
    {
        $this->ensureTablesExist();
    }

    private function ensureTablesExist()
    {
        // Table Favoris
        if (!Schema::hasTable('favoris')) {
            Schema::create('favoris', function (Blueprint $table) {
                $table->id();
                $table->integer('id_user');
                $table->integer('id_produit');
                $table->timestamps();
            });
        }

        // Table Notifications
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->integer('id_user');
                $table->string('titre');
                $table->text('contenu');
                $table->string('type')->default('info'); // info, success, warning, order
                $table->boolean('est_lue')->default(false);
                $table->timestamps();
            });
        }
    }

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
     * Get buyer orders.
     */
    public function getOrders($id)
    {
        $orders = DB::table('commande')
            ->join('commande_produit', 'commande.id_commande', '=', 'commande_produit.id_commande')
            ->join('produit', 'produit.id_produit', '=', 'commande_produit.id_produit')
            ->join('vendeur', 'vendeur.id_user', '=', 'produit.id_vendeur')
            ->where('commande.id_user', $id)
            ->select(
                'commande.id_commande',
                'commande.date_commande',
                'commande.total',
                'commande_produit.id_produit',
                'commande_produit.quantite',
                'commande_produit.prix_unitaire',
                'commande_produit.statut as statut_item',
                'produit.titre',
                'produit.photo_principale',
                'vendeur.nom_boutique'
            )
            ->orderBy('commande.date_commande', 'desc')
            ->get();

        return response()->json($orders);
    }
}
