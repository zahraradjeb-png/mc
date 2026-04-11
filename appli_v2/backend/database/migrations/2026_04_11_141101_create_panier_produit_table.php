<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePanierProduitTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('panier_produit')) {
            Schema::create('panier_produit', function (Blueprint $table) {
                $table->id('id_panier_produit'); // Primary key auto-inc (convention)
                $table->unsignedBigInteger('id_panier');
                $table->unsignedInteger('id_produit');
                $table->integer('quantite')->default(1);
                $table->decimal('prix_unitaire', 10, 2);
                $table->timestamps();

                $table->foreign('id_panier')
                      ->references('id_panier')
                      ->on('panier')
                      ->onDelete('cascade');

                $table->foreign('id_produit')
                      ->references('id_produit')
                      ->on('produit')
                      ->onDelete('cascade');
                      
                // On évite les doublons de produit dans un même panier
                $table->unique(['id_panier', 'id_produit']);
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
        Schema::dropIfExists('panier_produit');
    }
}
