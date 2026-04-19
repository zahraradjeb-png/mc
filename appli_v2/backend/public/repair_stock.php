<?php
// Script de secours pour réinitialiser les stocks (Version Public)
define('LARAVEL_START', microtime(true));

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';

use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

try {
    // On remet tout à 99
    $affected = DB::table('produit')->update(['quantite' => 99, 'est_disponible' => 1]);
    
    echo "<div style='font-family:sans-serif; text-align:center; padding:50px;'>";
    echo "<h1 style='color:#16a34a;'>✅ Stocks réinitialisés !</h1>";
    echo "<p style='font-size:1.2rem;'>$affected produits ont maintenant 99 exemplaires en stock.</p>";
    echo "<p>Vous pouvez maintenant retourner sur le site et finaliser votre paiement.</p>";
    echo "<a href='/Frontend/index.html' style='display:inline-block; padding:10px 20px; background:#e5a657; color:white; text-decoration:none; border-radius:5px;'>Retour au catalogue</a>";
    echo "</div>";
} catch (\Exception $e) {
    echo "<h1>❌ Erreur lors de la mise à jour</h1>";
    echo "<pre>" . $e->getMessage() . "</pre>";
}
