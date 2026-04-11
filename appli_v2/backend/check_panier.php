<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

foreach (['panier', 'panier_produit'] as $t) {
    echo "Table: $t\n";
    try {
        $cols = DB::select("DESCRIBE $t");
        foreach($cols as $c) echo "  - {$c->Field} ({$c->Type})\n";
    } catch(\Exception $e) { echo "  Error: " . $e->getMessage() . "\n"; }
    echo "\n";
}
