<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\ProductController;

// ── Produits ──
Route::get('/produits', [ProductController::class, 'index']);
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

// ── Catégories ──
Route::get('/categories', function () {
    $categories = DB::table('categorie')->get();
    return response()->json($categories);
});

// ── Vendeurs ──
Route::get('/vendeurs', function () {
    $vendeurs = DB::table('vendeur')
        ->join('users', 'users.id_user', '=', 'vendeur.id_user')
        ->select('vendeur.*', 'users.nom', 'users.prenom')
        ->get();
    return response()->json($vendeurs);
});

use App\Http\Controllers\AuthController;

Route::post('/inscription', [AuthController::class, 'inscription']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
