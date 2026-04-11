<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$t = 'panier';
$cols = DB::select("SHOW COLUMNS FROM $t");
foreach($cols as $c) echo $c->Field . ",";
echo "\n";
$t = 'panier_produit';
$cols = DB::select("SHOW COLUMNS FROM $t");
foreach($cols as $c) echo $c->Field . ",";
echo "\n";
