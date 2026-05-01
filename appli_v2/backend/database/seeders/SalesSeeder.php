<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Seeder de données de ventes pour l'IA de prédiction.
 * Génère des commandes réalistes sur les 8 derniers mois
 * pour le vendeur existant dans la base.
 */
class SalesSeeder extends Seeder
{
    public function run()
    {
        // Récupérer le premier vendeur existant
        $vendeur = DB::table('vendeur')->first();
        if (!$vendeur) {
            $this->command->error('Aucun vendeur trouvé. Créez un vendeur d\'abord.');
            return;
        }

        $vendeurId = $vendeur->id_user;
        $this->command->info("Génération de ventes pour le vendeur ID: {$vendeurId} ({$vendeur->nom_boutique})");

        // Récupérer les produits du vendeur
        $produits = DB::table('produit')->where('id_vendeur', $vendeurId)->get();
        if ($produits->isEmpty()) {
            $this->command->error('Aucun produit trouvé pour ce vendeur. Ajoutez des produits d\'abord.');
            return;
        }

        // Récupérer ou créer un acheteur de test
        $acheteur = DB::table('acheteur')->first();
        if (!$acheteur) {
            // Chercher un user acheteur
            $userAcheteur = DB::table('users')->where('role', 'ACHETEUR')->first();
            if (!$userAcheteur) {
                $userAcheteur = DB::table('users')->where('role', 'BOTH')->first();
            }
            if (!$userAcheteur) {
                $this->command->error('Aucun acheteur trouvé.');
                return;
            }
            DB::table('acheteur')->insertOrIgnore([
                'id_user'   => $userAcheteur->id_user,
                'adresse'   => '123 Rue de Test',
                'telephone' => '0612345678',
            ]);
            $acheteurId = $userAcheteur->id_user;
        } else {
            $acheteurId = $acheteur->id_user;
        }

        // S'assurer qu'un panier existe
        $panierId = DB::table('panier')->where('id_acheteur', $acheteurId)->value('id_panier');
        if (!$panierId) {
            $panierId = DB::table('panier')->insertGetId(['id_acheteur' => $acheteurId]);
        }

        // Ventes mensuelles simulées (tendance croissante avec variation)
        // Mois: -8, -7, -6, -5, -4, -3, -2, -1 (mois actuel)
        $salesPattern = [2, 3, 2, 4, 5, 4, 6, 7];

        $this->command->info("Génération de commandes sur 8 mois...");

        $totalOrders = 0;
        foreach ($salesPattern as $monthsAgo => $orderCount) {
            $monthOffset = count($salesPattern) - 1 - $monthsAgo;
            $baseDate = Carbon::now()->subMonths($monthOffset)->startOfMonth();

            for ($o = 0; $o < $orderCount; $o++) {
                // Date aléatoire dans le mois
                $day = rand(1, min(28, $baseDate->daysInMonth));
                $hour = rand(8, 21);
                $orderDate = $baseDate->copy()->day($day)->hour($hour)->minute(rand(0, 59));

                // Choisir 1 à 3 produits aléatoires
                $numItems = rand(1, min(3, $produits->count()));
                $selectedProducts = $produits->random($numItems);

                $montantTotal = 0;
                $items = [];

                foreach ($selectedProducts as $prod) {
                    $qty = rand(1, 2);
                    $montantTotal += $prod->prix * $qty;
                    $items[] = [
                        'id_produit'    => $prod->id_produit,
                        'quantite'      => $qty,
                        'prix_unitaire' => $prod->prix,
                        'statut'        => $this->randomStatus(),
                    ];
                }

                // Créer la commande
                $idCommande = DB::table('commande')->insertGetId([
                    'id_acheteur'   => $acheteurId,
                    'id_panier'     => $panierId,
                    'date_commande' => $orderDate,
                    'statut'        => 'CONFIRMEE',
                    'montant_total' => round($montantTotal, 2),
                ]);

                // Ajouter les items
                foreach ($items as $item) {
                    DB::table('commande_produit')->insert(array_merge(
                        $item,
                        ['id_commande' => $idCommande]
                    ));
                }

                // Créer le paiement
                DB::table('paiement')->insert([
                    'id_commande'   => $idCommande,
                    'montant'       => round($montantTotal, 2),
                    'mode_paiement' => 'SIMULATION',
                    'statut'        => 'VALIDE',
                    'date_paiement' => $orderDate,
                ]);

                $totalOrders++;
            }
        }

        // Ajouter des favoris sur quelques produits
        $favCount = 0;
        foreach ($produits->random(min(3, $produits->count())) as $prod) {
            DB::table('favoris')->insertOrIgnore([
                'id_user'    => $acheteurId,
                'id_produit' => $prod->id_produit,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $favCount++;
        }

        // Ajouter quelques avis
        $avisCount = 0;
        try {
            foreach ($produits->random(min(4, $produits->count())) as $prod) {
                DB::table('avis')->insertOrIgnore([
                    'id_produit'  => $prod->id_produit,
                    'id_user'     => $acheteurId,
                    'note'        => rand(3, 5),
                    'commentaire' => $this->randomComment(),
                    'date_avis'   => Carbon::now()->subDays(rand(1, 60)),
                ]);
                $avisCount++;
            }
        } catch (\Exception $e) {
            $this->command->warn("Table 'avis' non accessible, avis ignorés.");
        }

        $this->command->info("✅ Seeder terminé !");
        $this->command->info("   → {$totalOrders} commandes créées");
        $this->command->info("   → {$favCount} favoris ajoutés");
        $this->command->info("   → {$avisCount} avis ajoutés");
    }

    private function randomStatus()
    {
        $statuses = ['LIVRE', 'LIVRE', 'LIVRE', 'EXPEDIE', 'EN_PREPARATION'];
        return $statuses[array_rand($statuses)];
    }

    private function randomComment()
    {
        $comments = [
            'Excellent produit, exactement comme décrit !',
            'Très bonne qualité, livraison rapide.',
            'Superbe vinyle, son impeccable.',
            'Bien emballé, merci !',
            'Conforme à la description, je recommande.',
            'Un peu abîmé mais acceptable pour le prix.',
            'Magnifique pièce de collection !',
        ];
        return $comments[array_rand($comments)];
    }
}
