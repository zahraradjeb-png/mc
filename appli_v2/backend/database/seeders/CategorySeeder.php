<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['id_categorie' => 1, 'nom' => 'CDs', 'type_categorie' => 'CD'],
            ['id_categorie' => 2, 'nom' => 'Cassettes', 'type_categorie' => 'CASSETTE'],
            ['id_categorie' => 3, 'nom' => 'Vinyles', 'type_categorie' => 'VINYLE'],
            ['id_categorie' => 4, 'nom' => 'Posters', 'type_categorie' => 'POSTER'],
            ['id_categorie' => 5, 'nom' => 'Instruments', 'type_categorie' => 'INSTRUMENT'],
        ];

        foreach ($categories as $cat) {
            DB::table('categorie')->updateOrInsert(
                ['id_categorie' => $cat['id_categorie']],
                ['nom' => $cat['nom'], 'type_categorie' => $cat['type_categorie']]
            );
        }
    }
}
