<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $tables = DB::select('SHOW TABLES');
    foreach ($tables as $table) {
        $name = array_values((array)$table)[0];
        echo "Table: $name\n";
        $columns = DB::select("DESCRIBE $name");
        foreach ($columns as $col) {
            echo "  - {$col->Field} ({$col->Type})\n";
        }
        echo "\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
