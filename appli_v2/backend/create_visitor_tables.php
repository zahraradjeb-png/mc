<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

try {
    Schema::dropIfExists('visitor_activities');
    Schema::create('visitor_activities', function (Blueprint $table) {
        $table->id();
        $table->string('visitor_id', 64);
        $table->string('type', 50);
        $table->string('label', 255)->nullable();
        $table->integer('id_produit')->nullable();
        $table->timestamps();
        $table->index('visitor_id');
        $table->index('type');
    });
    echo "✅ visitor_activities recreated\n";

    Schema::dropIfExists('avis_visiteur');
    Schema::create('avis_visiteur', function (Blueprint $table) {
        $table->id('id_avis');
        $table->integer('id_produit');
        $table->string('visitor_id', 64);
        $table->string('pseudo', 100)->default('Visiteur');
        $table->integer('note');
        $table->text('commentaire')->nullable();
        $table->timestamp('date_avis')->useCurrent();
        $table->timestamps();
        $table->index('visitor_id');
        $table->index('id_produit');
    });
    echo "✅ avis_visiteur recreated\n";

    echo "\n🎉 Done!\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
