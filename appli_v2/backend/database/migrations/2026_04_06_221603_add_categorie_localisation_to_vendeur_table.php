<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCategorieLocalisationToVendeurTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('vendeur', function (Blueprint $table) {
            $table->string('categorie_principale', 100)->nullable();
            $table->string('localisation', 150)->nullable();
            $table->string('photo_profil', 255)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('vendeur', function (Blueprint $table) {
            $table->dropColumn(['categorie_principale', 'localisation', 'photo_profil']);
        });
    }
}
