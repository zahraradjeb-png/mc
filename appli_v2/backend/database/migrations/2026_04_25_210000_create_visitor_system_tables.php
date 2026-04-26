<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVisitorSystemTables extends Migration
{
    public function up()
    {
        // 1. Table activités visiteur
        if (!Schema::hasTable('visitor_activities')) {
            Schema::create('visitor_activities', function (Blueprint $table) {
                $table->id();
                $table->string('visitor_id', 64); // UUID localStorage
                $table->string('type', 50); // cart_add, fav_add, fav_remove, review
                $table->string('label', 255)->nullable();
                $table->integer('id_produit')->unsigned()->nullable();
                $table->timestamps();

                $table->index('visitor_id');
                $table->index('type');
            });
        }

        // 2. Table avis visiteur (anonymous reviews)
        if (!Schema::hasTable('avis_visiteur')) {
            Schema::create('avis_visiteur', function (Blueprint $table) {
                $table->id('id_avis');
                $table->integer('id_produit');
                $table->string('visitor_id', 64);
                $table->string('pseudo', 100)->default('Visiteur');
                $table->integer('note');
                $table->text('commentaire')->nullable();
                $table->timestamp('date_avis')->useCurrent();
                $table->timestamps();

                $table->foreign('id_produit')
                      ->references('id_produit')
                      ->on('produit')
                      ->onDelete('cascade');

                $table->index('visitor_id');
                $table->index('id_produit');
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('avis_visiteur');
        Schema::dropIfExists('visitor_activities');
    }
}
