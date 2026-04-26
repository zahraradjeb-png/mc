<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAcheteurActivitiesAndReviewsTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Table activities
        if (!Schema::hasTable('activities')) {
            Schema::create('activities', function (Blueprint $table) {
                $table->id();
                $table->integer('user_id');
                $table->string('type', 50); // review_added, cart_add, order_placed
                $table->string('description', 255);
                $table->timestamp('date')->useCurrent();
                $table->timestamps();
            });
        }

        // Table reviews (Buyer specific, distinct from avis_visiteur)
        if (!Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->id();
                $table->integer('user_id');
                $table->integer('product_id');
                $table->text('contenu');
                $table->integer('note');
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('activities');
    }
}
