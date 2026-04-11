<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = ['panier', 'panier_produit', 'commande', 'commande_produit'];
$schema = [];
foreach ($tables as $t) {
    try {
        $schema[$t] = DB::select("SHOW COLUMNS FROM $t");
    } catch (\Exception $e) {
        $schema[$t] = "Error: " . $e->getMessage();
    }
}
echo json_encode($schema, JSON_PRETTY_PRINT);
