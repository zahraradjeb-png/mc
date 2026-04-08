<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProduitPhotoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('produit_photo', function (Blueprint $table) {
            $table->increments('id_photo');
            $table->unsignedInteger('id_produit');
            $table->string('chemin', 500)->nullable();

            // Clé étrangère vers produit
            $table->foreign('id_produit')
                  ->references('id_produit')
                  ->on('produit')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('produit_photo');
    }
}
