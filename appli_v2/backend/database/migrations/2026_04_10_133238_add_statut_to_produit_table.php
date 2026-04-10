<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStatutToProduitTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('produit', function (Blueprint $table) {
            $table->string('statut')->default('EN_ATTENTE')->after('etat');
        });

        // Mettre à jour les produits existants en VALIDE pour ne pas casser le catalogue
        DB::table('produit')->update(['statut' => 'VALIDE']);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('produit', function (Blueprint $table) {
            $table->dropColumn('statut');
        });
    }
}
