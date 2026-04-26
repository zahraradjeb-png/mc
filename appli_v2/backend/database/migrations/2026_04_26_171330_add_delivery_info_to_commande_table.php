<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDeliveryInfoToCommandeTable extends Migration
{
    public function up()
    {
        Schema::table('commande', function (Blueprint $table) {
            if (!Schema::hasColumn('commande', 'adresse_livraison')) {
                $table->string('adresse_livraison')->nullable();
            }
            if (!Schema::hasColumn('commande', 'telephone')) {
                $table->string('telephone')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('commande', function (Blueprint $table) {
            $table->dropColumn(['adresse_livraison', 'telephone']);
        });
    }
}
