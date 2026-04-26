<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$tables = Illuminate\Support\Facades\DB::select('SHOW TABLES');
print_r($tables);
foreach($tables as $table) {
    $name = current((array)$table);
    echo "\n--- $name ---\n";
    print_r(Illuminate\Support\Facades\Schema::getColumnListing($name));
}
