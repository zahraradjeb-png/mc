<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePanierTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // On utilise IF NOT EXISTS car le USER a dit que la table existe déjà
        if (!Schema::hasTable('panier')) {
            Schema::create('panier', function (Blueprint $table) {
                $table->integer('id_panier', true);
                $table->integer('id_acheteur');

                $table->unique('id_acheteur');
                $table->foreign('id_acheteur')
                      ->references('id_user')
                      ->on('acheteur')
                      ->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('panier');
    }
}
