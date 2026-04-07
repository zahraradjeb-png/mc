<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStatusToCommandeProduitTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table('commande_produit', function (Blueprint $table) {
            $table->enum('statut', ['EN_PREPARATION', 'EXPEDIE', 'LIVRE', 'ANNULE'])->default('EN_PREPARATION');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commande_produit', function (Blueprint $table) {
            $table->dropColumn('statut');
        });
    }
}
