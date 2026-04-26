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
Route::get('/admin/notifications', [AdminController::class, 'getNotifications']);

use App\Http\Controllers\AuthController;

Route::post('/inscription', [AuthController::class, 'inscription']);
Route::post('/login', [AuthController::class, 'login']);
Route::put('/user/{id}/profile', [AuthController::class, 'updateProfile']);
Route::post('/user/{id}/switch-role', [AuthController::class, 'switchRole']);
