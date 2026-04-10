<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run()
    {
        DB::table('users')->insert([
            'nom'    => 'Admin',
            'prenom' => 'Gold',
            'email'  => 'admin@gold.fr',
            'mdp'    => Hash::make('admin123'),
            'role'   => 'ADMIN'
        ]);
    }
}

