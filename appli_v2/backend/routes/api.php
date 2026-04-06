<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// ── Produits ──
Route::get('/produits', function () {
    $produits = DB::table('produit')->get();
    return response()->json($produits);
});

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
