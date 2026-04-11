<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

foreach (['panier', 'panier_produit'] as $t) {
    echo "--- $t ---\n";
    $cols = DB::select("SHOW COLUMNS FROM $t");
    foreach($cols as $c) {
        printf("%-20s %-20s %-10s\n", $c->Field, $c->Type, $c->Null);
    }
}
