<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\ProductController;

//la liste de touts les adresses (urls)
//  que le front peut appeler 

// ── Produits ──
Route::get('/produits', [ProductController::class, 'index']);
Route::get('/produits-populaires', [ProductController::class, 'getPopular']);
Route::post('/produits', [ProductController::class, 'store']);
Route::get('/produits/{id}', [ProductController::class, 'show']);
Route::post('/produits-update/{id}', [ProductController::class, 'update']);
Route::delete('/produits/{id}', [ProductController::class, 'destroy']);
Route::delete('/photos/{id}', [ProductController::class, 'destroyPhoto']);

// ── Vendeur ──
Route::put('/vendeurs/{id}', [\App\Http\Controllers\SellerController::class, 'updateProfile']);
Route::post('/vendeurs/{id}/photo', [\App\Http\Controllers\SellerController::class, 'uploadPhoto']);
Route::get('/vendeurs/{id}/avis', [\App\Http\Controllers\SellerController::class, 'getReviews']);
Route::get('/vendeurs/{id}/commandes', [\App\Http\Controllers\SellerController::class, 'getOrders']);
Route::put('/vendeurs/{vendeurId}/commandes/{orderId}/valider', [\App\Http\Controllers\SellerController::class, 'validerCommande']);
Route::put('/vendeurs/{vendeurId}/commandes/{orderId}/produit/{productId}/status', [\App\Http\Controllers\SellerController::class, 'updateOrderItemStatus']);
Route::get('/vendeurs/{id}/stats', [\App\Http\Controllers\SellerController::class, 'getStats']);
Route::get('/vendeurs/{id}/finance', [\App\Http\Controllers\SellerController::class, 'getFinance']);
Route::put('/vendeurs/{id}/password', [\App\Http\Controllers\SellerController::class, 'updatePassword']);

// ── Acheteur ──
Route::get('/acheteurs/{id}/favoris', [\App\Http\Controllers\BuyerController::class, 'getFavorites']);
Route::post('/acheteurs/{id}/favoris', [\App\Http\Controllers\BuyerController::class, 'toggleFavorite']);
Route::get('/acheteurs/{id}/notifications', [\App\Http\Controllers\BuyerController::class, 'getNotifications']);
Route::put('/acheteurs/{id}/notifications/{notifId}/lue', [\App\Http\Controllers\BuyerController::class, 'markAsRead']);
Route::get('/acheteurs/{id}/commandes', [\App\Http\Controllers\BuyerController::class, 'getOrders']);

// ── Panier ──
use App\Http\Controllers\PanierController;
Route::get('/panier/{id_acheteur}', [PanierController::class, 'index']);
Route::post('/panier', [PanierController::class, 'store']);
Route::put('/panier/ligne/{id_panier}/{id_produit}', [PanierController::class, 'update']);
Route::delete('/panier/ligne/{id_panier}/{id_produit}', [PanierController::class, 'destroy']);
Route::delete('/panier/ligne/user/{id_acheteur}/{id_produit}', [PanierController::class, 'destroyByAcheteur']);
Route::delete('/panier/clear/{id_acheteur}', [PanierController::class, 'clear']);

// ── Commandes (acheteur) ──
Route::post('/commandes', [\App\Http\Controllers\CommandeController::class, 'store']);
Route::put('/acheteurs/{acheteurId}/commandes/{orderId}/annuler', [\App\Http\Controllers\CommandeController::class, 'cancel']);

// ── Catégories ──
Route::get('/categories', function () {
    $categories = DB::table('categorie')->get();
    return response()->json($categories);
});

Route::get('/vendeurs', [\App\Http\Controllers\SellerController::class, 'index']);
Route::get('/vendeurs-overview', [\App\Http\Controllers\SellerController::class, 'getSellersWithProducts']);

// ── Admin ──
use App\Http\Controllers\AdminController;
Route::get('/admin/stats', [AdminController::class, 'getStats']);
Route::get('/admin/produits/en-attente', [AdminController::class, 'getPendingProducts']);
Route::get('/admin/produits/statut/{statut}', [AdminController::class, 'getProductsByStatus']);
Route::get('/admin/ventes', [AdminController::class, 'getRecentSales']);
Route::get('/admin/commandes', [AdminController::class, 'getAllSales']);
Route::get('/admin/users', [AdminController::class, 'getUsers']);
Route::get('/admin/notifications', [AdminController::class, 'getNotifications']);
Route::get('/admin/catalogue-recent', [AdminController::class, 'getRecentCatalogue']);
Route::post('/admin/produits/{id}/moderer', [AdminController::class, 'moderateProduct']);
Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
Route::get('/admin/orders', [AdminController::class, 'getAllOrders']);

use App\Http\Controllers\AuthController;

Route::post('/inscription', [AuthController::class, 'inscription']);
Route::post('/login', [AuthController::class, 'login']);
Route::put('/user/{id}/profile', [AuthController::class, 'updateProfile']);
Route::post('/user/{id}/switch-role', [AuthController::class, 'switchRole']);
Route::post('/become-seller', function(Request $request) {
    try {
        $request->validate([
            'user_id'      => 'required|integer',
            'shop_name'    => 'required|string|max:200',
            'description'  => 'nullable|string',
            'categories'   => 'nullable|string',
            'address'      => 'nullable|string',
        ]);

        $userId = $request->user_id;

        DB::transaction(function() use ($userId, $request) {
            // 1. Update user role
            DB::table('users')->where('id_user', $userId)->update(['role' => 'BOTH']);

            // 2. Upsert 'sellers' table (new system)
            DB::table('sellers')->updateOrInsert(
                ['user_id' => $userId],
                [
                    'shop_name'   => $request->shop_name,
                    'description' => $request->description,
                    'categories'  => $request->categories,
                    'address'     => $request->address,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]
            );

            // 3. Upsert 'vendeur' table (existing system for dashboard compatibility)
            DB::table('vendeur')->updateOrInsert(
                ['id_user' => $userId],
                [
                    'nom_boutique'         => $request->shop_name,
                    'description'          => $request->description,
                    'localisation'         => $request->address,
                    'categorie_principale' => $request->categories,
                ]
            );
        });

        return response()->json(['message' => 'Félicitations, vous êtes maintenant vendeur !'], 201);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
    }
});

// ── Visiteur ──
use App\Http\Controllers\VisitorController;
Route::post('/visitor/avis', [VisitorController::class, 'storeReview']);
Route::get('/visitor/avis/{id_produit}', [VisitorController::class, 'getReviews']);
Route::post('/visitor/activity', [VisitorController::class, 'logActivity']);
Route::get('/visitor/activity/{visitor_id}', [VisitorController::class, 'getActivities']);
Route::get('/vendeurs/{id}/boutique', [VisitorController::class, 'getSellerShop']);
Route::get('/produits/{id}/details', [VisitorController::class, 'getProductFull']);

Route::post('/orders', function(Request $request) {
    try {
        $request->validate([
            'user_id' => 'required|integer',
            'items' => 'required|array',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'total_price' => 'required|numeric'
        ]);

        $idAcheteur = $request->user_id;

        return DB::transaction(function () use ($idAcheteur, $request) {
            // 1. Mise à jour / Création profil acheteur
            DB::table('acheteur')->updateOrInsert(
                ['id_user' => $idAcheteur],
                [
                    'adresse'   => $request->address ?? '',
                    'telephone' => $request->phone ?? '',
                ]
            );

            // 2. Gestion du panier (nécessaire pour la FK de la table commande)
            $idPanier = DB::table('panier')->where('id_acheteur', $idAcheteur)->value('id_panier');
            if (!$idPanier) {
                $idPanier = DB::table('panier')->insertGetId(['id_acheteur' => $idAcheteur]);
            }

            // 3. Insertion dans la table 'commande' (Système existant)
            $idCommande = DB::table('commande')->insertGetId([
                'id_acheteur'   => $idAcheteur,
                'id_panier'     => $idPanier,
                'statut'        => 'EN_ATTENTE',
                'montant_total' => $request->total_price,
                'date_commande' => now(),
            ]);

            // 4. Insertion des produits dans 'commande_produit'
            foreach ($request->items as $item) {
                DB::table('commande_produit')->insert([
                    'id_commande'   => $idCommande,
                    'id_produit'    => $item['product_id'],
                    'quantite'      => $item['quantity'],
                    'prix_unitaire' => $item['price'] ?? 0,
                    'statut'        => 'EN_PREPARATION',
                ]);

                // Mise à jour du stock
                DB::table('produit')->where('id_produit', $item['product_id'])->decrement('quantite', $item['quantity']);
            }

            // 5. Enregistrement du paiement (Système existant)
            DB::table('paiement')->insert([
                'id_commande'   => $idCommande,
                'montant'       => $request->total_price,
                'mode_paiement' => 'SIMULATION',
                'statut'        => 'VALIDE',
                'date_paiement' => now(),
            ]);

            // 6. Logs d'activité et Notifications (Système acheteur)
            DB::table('activities')->insert([
                'user_id' => $idAcheteur, 'type' => 'order_placed',
                'description' => "Commande #{$idCommande} passée (EN_ATTENTE)",
                'date' => now(), 'created_at' => now(), 'updated_at' => now()
            ]);

            DB::table('user_notifications')->insert([
                'user_id' => $idAcheteur,
                'message' => "Votre commande #{$idCommande} est enregistrée.",
                'status' => 'unread', 'created_at' => now(), 'updated_at' => now()
            ]);

            return response()->json(['message' => 'Commande enregistrée dans la table commande.', 'id' => $idCommande], 201);
        });
    } catch (\Exception $e) {
        return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
    }
});

Route::get('/orders/user', function(Request $request) {
    $userId = $request->query('user_id');
    $orders = DB::table('commande')
        ->where('id_acheteur', $userId)
        ->orderByDesc('date_commande')
        ->get();
    
    foreach($orders as $o) {
        // Mappage pour compatibilité frontend
        $o->id = $o->id_commande;
        $o->status = $o->statut;
        $o->total_price = $o->montant_total;
        $o->created_at = $o->date_commande;
        $o->address = $o->adresse_livraison;
        $o->phone = $o->telephone;
        
        $o->items = DB::table('commande_produit')
            ->join('produit', 'produit.id_produit', '=', 'commande_produit.id_produit')
            ->where('id_commande', $o->id_commande)
            ->select('commande_produit.*', 'produit.titre as product_name', 'commande_produit.prix_unitaire as price', 'commande_produit.quantite as quantity', 'commande_produit.id_produit as product_id')
            ->get();
    }
    return response()->json($orders);
});

Route::get('/notifications', function(Request $request) {
    $notifs = DB::table('user_notifications')->where('user_id', $request->query('user_id'))->orderByDesc('created_at')->get();
    return response()->json($notifs);
});

Route::get('/activities', function(Request $request) {
    $activities = DB::table('activities')->where('user_id', $request->query('user_id'))->orderByDesc('date')->get();
    return response()->json($activities);
});

Route::post('/activities_log', function(Request $request) {
    $request->validate([
        'user_id' => 'required|integer',
        'type' => 'required|string',
        'description' => 'required|string'
    ]);

    DB::table('activities')->insert([
        'user_id' => $request->user_id,
        'type' => $request->type,
        'description' => $request->description,
        'date' => now(),
        'created_at' => now(),
        'updated_at' => now()
    ]);

    return response()->json(['message' => 'Activité enregistrée'], 201);
});

Route::post('/reviews', function(Request $request) {
    $request->validate([
        'id_user' => 'required|integer',
        'id_produit' => 'required|integer',
        'note' => 'required|integer|min:1|max:5',
        'commentaire' => 'nullable|string'
    ]);

    DB::transaction(function() use ($request) {
        // Insert into reviews table (New system)
        DB::table('reviews')->insert([
            'user_id' => $request->id_user,
            'product_id' => $request->id_produit,
            'contenu' => $request->commentaire ?? '',
            'note' => $request->note,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Fallback: Also insert into 'avis' if it exists to keep compatibility with VisitorController->getReviews
        try {
            DB::table('avis')->insert([
                'id_user' => $request->id_user,
                'id_produit' => $request->id_produit,
                'note' => $request->note,
                'commentaire' => $request->commentaire ?? '',
                'date_avis' => now()
            ]);
        } catch (\Exception $e) {}

        // Log Activity
        DB::table('activities')->insert([
            'user_id' => $request->id_user,
            'type' => 'review_added',
            'description' => "Avis laissé sur le produit #{$request->id_produit} ({$request->note}/5)",
            'date' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    });

    return response()->json(['message' => 'Avis enregistré avec succès'], 201);
});

Route::post('/become-acheteur', function(Request $request) {
    try {
        $request->validate(['user_id' => 'required|integer']);
        $userId = $request->user_id;

        DB::transaction(function() use ($userId) {
            // 1. Update role to BOTH
            DB::table('users')->where('id_user', $userId)->update(['role' => 'BOTH']);

            // 2. Ensure entry in legacy 'acheteur' table
            $exists = DB::table('acheteur')->where('id_user', $userId)->exists();
            if (!$exists) {
                DB::table('acheteur')->insert([
                    'id_user'   => $userId,
                    'adresse'   => '',
                    'telephone' => ''
                ]);
            }
        });

        // Get updated user
        $user = DB::table('users')->where('id_user', $userId)->first();

        return response()->json([
            'message' => 'Vous êtes maintenant aussi acheteur !',
            'user'    => $user
        ], 200);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
    }
});
