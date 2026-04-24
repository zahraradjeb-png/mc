<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class FixProduitStatutValidee extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Mettre tous les produits existants en statut "VALIDEE" pour qu'ils s'affichent à l'accueil
        \Illuminate\Support\Facades\DB::table('produit')->update(['statut' => 'VALIDEE']);
        \Illuminate\Support\Facades\DB::table('annonce')->update(['statut' => 'VALIDEE']);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
