<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBuyerSystemTables extends Migration
{
    public function up()
    {
        // Drop the dummy table created by artisan
        Schema::dropIfExists('buyer_system_tables');

        // Modify users table to add role
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['ACHETEUR', 'VENDEUR', 'ADMIN', 'BOTH'])->default('ACHETEUR');
            }
        });

        // Sellers table
        if (!Schema::hasTable('sellers')) {
            Schema::create('sellers', function (Blueprint $table) {
                $table->id();
                $table->integer('user_id'); // Match users table pk type
                $table->string('shop_name');
                $table->text('description')->nullable();
                $table->string('categories')->nullable();
                $table->string('address')->nullable();
                $table->timestamps();
                
                $table->foreign('user_id')->references('id_user')->on('users')->onDelete('cascade');
            });
        }

        // Orders table
        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table) {
                $table->id();
                $table->integer('user_id');
                $table->decimal('total_price', 10, 2);
                $table->string('status')->default('en attente');
                $table->string('phone')->nullable();
                $table->string('address')->nullable();
                $table->timestamps();

                $table->foreign('user_id')->references('id_user')->on('users')->onDelete('cascade');
            });
        }

        // Order Items table
        if (!Schema::hasTable('order_items')) {
            Schema::create('order_items', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('order_id');
                $table->integer('product_id')->unsigned(); // product table uses integer id_produit
                $table->integer('quantity')->default(1);
                $table->timestamps();

                $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            });
        }

        // Notifications table
        if (!Schema::hasTable('user_notifications')) {
            Schema::create('user_notifications', function (Blueprint $table) {
                $table->id();
                $table->integer('user_id');
                $table->string('message');
                $table->string('status')->default('unread'); // unread, read
                $table->timestamps();

                $table->foreign('user_id')->references('id_user')->on('users')->onDelete('cascade');
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('user_notifications');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('sellers');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
}
