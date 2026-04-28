<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PredictionController extends Controller
{
    /**
     * ══════════════════════════════════════════════════════════
     *  IA — Prédiction de ventes pour le vendeur
     *  Algorithme : Régression Linéaire (Moindres Carrés)
     * ══════════════════════════════════════════════════════════
     */
    public function getPredictions($vendeurId)
    {
        $vendeurId = (int) $vendeurId;

        // 1. Récupérer les ventes mensuelles (12 derniers mois)
        $monthlySales = $this->getMonthlySales($vendeurId, 12);

        // 2. Appliquer la régression linéaire
        $regression = $this->linearRegression($monthlySales);

        // 3. Prédire les 3 prochains mois
        $predictions = $this->predictNextMonths($regression, $monthlySales, 3);

        // 4. Analyser les top produits
        $topProducts = $this->getTopSellingProducts($vendeurId);

        // 5. Analyser les catégories
        $categoryAnalysis = $this->analyzeCategoryTrends($vendeurId);

        // 6. Produits favorisés mais pas encore achetés
        $hotProducts = $this->getHotProducts($vendeurId);

        // 7. Générer les recommandations textuelles
        $recommendations = $this->generateRecommendations(
            $vendeurId, $monthlySales, $regression, $categoryAnalysis, $hotProducts
        );

        // 8. Score de confiance (R²)
        $confidence = $this->calculateRSquared($monthlySales, $regression);

        // 9. Tendance en pourcentage
        $trendPercent = $this->calculateTrendPercent($monthlySales);

        // 10. Revenus prédits pour le mois prochain
        $nextMonthRevenue = !empty($predictions) ? $predictions[0]['revenue'] : 0;

        return response()->json([
            'monthly_sales'    => $monthlySales,
            'predictions'      => $predictions,
            'regression'       => [
                'slope'     => round($regression['slope'], 2),
                'intercept' => round($regression['intercept'], 2),
            ],
            'trend_percent'    => $trendPercent,
            'confidence_score' => $confidence,
            'next_month_revenue' => round($nextMonthRevenue, 2),
            'top_products'     => $topProducts,
            'category_analysis' => $categoryAnalysis,
            'hot_products'     => $hotProducts,
            'recommendations'  => $recommendations,
        ]);
    }

    /* ════════════════════════════════════════════════════
     *  COLLECTE DES DONNÉES
     * ════════════════════════════════════════════════════ */

    /**
     * Récupérer les ventes mensuelles du vendeur.
     */
    private function getMonthlySales($vendeurId, $months = 12)
    {
        $startDate = Carbon::now()->subMonths($months)->startOfMonth();

        $sales = DB::table('commande_produit')
            ->join('produit', 'commande_produit.id_produit', '=', 'produit.id_produit')
            ->join('commande', 'commande_produit.id_commande', '=', 'commande.id_commande')
            ->where('produit.id_vendeur', $vendeurId)
            ->where('commande_produit.statut', '!=', 'ANNULE')
            ->where('commande.date_commande', '>=', $startDate)
            ->select(
                DB::raw('YEAR(commande.date_commande) as year'),
                DB::raw('MONTH(commande.date_commande) as month'),
                DB::raw('SUM(commande_produit.prix_unitaire * commande_produit.quantite) as revenue'),
                DB::raw('SUM(commande_produit.quantite) as total_items'),
                DB::raw('COUNT(DISTINCT commande.id_commande) as total_orders')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->toArray();

        // Remplir les mois manquants avec 0
        $result = [];
        $current = $startDate->copy();
        $now = Carbon::now();

        while ($current->lte($now)) {
            $y = $current->year;
            $m = $current->month;

            $found = null;
            foreach ($sales as $s) {
                if ($s->year == $y && $s->month == $m) {
                    $found = $s;
                    break;
                }
            }

            $result[] = [
                'year'         => $y,
                'month'        => $m,
                'month_label'  => $this->frenchMonth($m) . ' ' . $y,
                'revenue'      => $found ? round((float) $found->revenue, 2) : 0,
                'total_items'  => $found ? (int) $found->total_items : 0,
                'total_orders' => $found ? (int) $found->total_orders : 0,
            ];

            $current->addMonth();
        }

        return $result;
    }

    /* ════════════════════════════════════════════════════
     *  ALGORITHME IA : RÉGRESSION LINÉAIRE
     *  Méthode des Moindres Carrés (Least Squares)
     * ════════════════════════════════════════════════════ */

    /**
     * Calcule la droite de régression y = mx + b
     * à partir des données mensuelles.
     *
     * m = (n·Σxy − Σx·Σy) / (n·Σx² − (Σx)²)
     * b = (Σy − m·Σx) / n
     */
    private function linearRegression($monthlySales)
    {
        $n = count($monthlySales);

        if ($n < 2) {
            return ['slope' => 0, 'intercept' => 0];
        }

        $sumX = 0;
        $sumY = 0;
        $sumXY = 0;
        $sumX2 = 0;

        foreach ($monthlySales as $i => $data) {
            $x = $i + 1; // mois 1, 2, 3, ...
            $y = $data['revenue'];

            $sumX  += $x;
            $sumY  += $y;
            $sumXY += ($x * $y);
            $sumX2 += ($x * $x);
        }

        $denominator = ($n * $sumX2) - ($sumX * $sumX);

        if ($denominator == 0) {
            return ['slope' => 0, 'intercept' => $sumY / $n];
        }

        $slope     = (($n * $sumXY) - ($sumX * $sumY)) / $denominator;
        $intercept = ($sumY - ($slope * $sumX)) / $n;

        return [
            'slope'     => $slope,
            'intercept' => $intercept,
        ];
    }

    /**
     * Prédit les revenus pour les N prochains mois.
     */
    private function predictNextMonths($regression, $monthlySales, $numMonths = 3)
    {
        $n = count($monthlySales);
        $predictions = [];
        $lastMonth = !empty($monthlySales)
            ? Carbon::createFromDate($monthlySales[$n - 1]['year'], $monthlySales[$n - 1]['month'], 1)
            : Carbon::now();

        for ($i = 1; $i <= $numMonths; $i++) {
            $x = $n + $i;
            $predicted = $regression['slope'] * $x + $regression['intercept'];
            $predicted = max(0, $predicted); // pas de revenus négatifs

            $futureMonth = $lastMonth->copy()->addMonths($i);

            $predictions[] = [
                'year'        => $futureMonth->year,
                'month'       => $futureMonth->month,
                'month_label' => $this->frenchMonth($futureMonth->month) . ' ' . $futureMonth->year,
                'revenue'     => round($predicted, 2),
                'is_prediction' => true,
            ];
        }

        return $predictions;
    }

    /**
     * Coefficient de détermination R² (0 à 1).
     * Plus R² est proche de 1, plus le modèle est fiable.
     */
    private function calculateRSquared($monthlySales, $regression)
    {
        $n = count($monthlySales);
        if ($n < 2) return 0;

        $meanY = array_sum(array_column($monthlySales, 'revenue')) / $n;

        $ssRes = 0; // Somme des carrés résiduels
        $ssTot = 0; // Somme totale des carrés

        foreach ($monthlySales as $i => $data) {
            $x = $i + 1;
            $yActual = $data['revenue'];
            $yPredicted = $regression['slope'] * $x + $regression['intercept'];

            $ssRes += pow($yActual - $yPredicted, 2);
            $ssTot += pow($yActual - $meanY, 2);
        }

        if ($ssTot == 0) return 0;

        $r2 = 1 - ($ssRes / $ssTot);
        return round(max(0, min(1, $r2)) * 100, 1); // en pourcentage
    }

    /**
     * Calcule la tendance en pourcentage.
     */
    private function calculateTrendPercent($monthlySales)
    {
        $n = count($monthlySales);
        if ($n < 2) return 0;

        // Comparer la moyenne des 3 derniers mois vs les 3 précédents
        $recentCount = min(3, $n);
        $olderCount  = min(3, $n - $recentCount);

        if ($olderCount < 1) return 0;

        $recentRevenue = 0;
        for ($i = $n - $recentCount; $i < $n; $i++) {
            $recentRevenue += $monthlySales[$i]['revenue'];
        }
        $recentAvg = $recentRevenue / $recentCount;

        $olderRevenue = 0;
        for ($i = $n - $recentCount - $olderCount; $i < $n - $recentCount; $i++) {
            $olderRevenue += $monthlySales[$i]['revenue'];
        }
        $olderAvg = $olderRevenue / $olderCount;

        if ($olderAvg == 0) return $recentAvg > 0 ? 100 : 0;

        return round((($recentAvg - $olderAvg) / $olderAvg) * 100, 1);
    }

    /* ════════════════════════════════════════════════════
     *  ANALYSES AVANCÉES
     * ════════════════════════════════════════════════════ */

    /**
     * Top 5 produits les plus vendus.
     */
    private function getTopSellingProducts($vendeurId)
    {
        return DB::table('commande_produit')
            ->join('produit', 'commande_produit.id_produit', '=', 'produit.id_produit')
            ->join('categorie', 'produit.id_categorie', '=', 'categorie.id_categorie')
            ->where('produit.id_vendeur', $vendeurId)
            ->where('commande_produit.statut', '!=', 'ANNULE')
            ->select(
                'produit.id_produit',
                'produit.titre',
                'produit.prix',
                'produit.artiste',
                'produit.rarete',
                'categorie.nom as categorie',
                'categorie.type_categorie',
                DB::raw('SUM(commande_produit.quantite) as total_sold'),
                DB::raw('SUM(commande_produit.prix_unitaire * commande_produit.quantite) as total_revenue')
            )
            ->groupBy(
                'produit.id_produit', 'produit.titre', 'produit.prix',
                'produit.artiste', 'produit.rarete',
                'categorie.nom', 'categorie.type_categorie'
            )
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();
    }

    /**
     * Analyse des ventes par catégorie.
     */
    private function analyzeCategoryTrends($vendeurId)
    {
        return DB::table('commande_produit')
            ->join('produit', 'commande_produit.id_produit', '=', 'produit.id_produit')
            ->join('categorie', 'produit.id_categorie', '=', 'categorie.id_categorie')
            ->where('produit.id_vendeur', $vendeurId)
            ->where('commande_produit.statut', '!=', 'ANNULE')
            ->select(
                'categorie.type_categorie',
                'categorie.nom as categorie_nom',
                DB::raw('SUM(commande_produit.quantite) as total_sold'),
                DB::raw('SUM(commande_produit.prix_unitaire * commande_produit.quantite) as total_revenue'),
                DB::raw('AVG(commande_produit.prix_unitaire) as avg_price')
            )
            ->groupBy('categorie.type_categorie', 'categorie.nom')
            ->orderByDesc('total_revenue')
            ->get();
    }

    /**
     * Produits en favoris chez les acheteurs (demande potentielle).
     */
    private function getHotProducts($vendeurId)
    {
        return DB::table('favoris')
            ->join('produit', 'favoris.id_produit', '=', 'produit.id_produit')
            ->where('produit.id_vendeur', $vendeurId)
            ->select(
                'produit.id_produit',
                'produit.titre',
                'produit.prix',
                'produit.artiste',
                'produit.quantite as stock',
                DB::raw('COUNT(favoris.id) as fav_count')
            )
            ->groupBy('produit.id_produit', 'produit.titre', 'produit.prix', 'produit.artiste', 'produit.quantite')
            ->orderByDesc('fav_count')
            ->limit(5)
            ->get();
    }

    /* ════════════════════════════════════════════════════
     *  RECOMMANDATIONS IA
     * ════════════════════════════════════════════════════ */

    /**
     * Génère des recommandations personnalisées basées sur les données.
     */
    private function generateRecommendations($vendeurId, $monthlySales, $regression, $categories, $hotProducts)
    {
        $recommendations = [];

        // 1. Tendance générale
        if ($regression['slope'] > 0) {
            $recommendations[] = [
                'icon'  => 'fas fa-chart-line',
                'type'  => 'success',
                'title' => 'Croissance positive détectée',
                'text'  => 'Vos ventes montrent une tendance à la hausse. Continuez à alimenter votre catalogue pour maintenir cette dynamique.',
            ];
        } elseif ($regression['slope'] < 0) {
            $recommendations[] = [
                'icon'  => 'fas fa-exclamation-triangle',
                'type'  => 'warning',
                'title' => 'Tendance à la baisse',
                'text'  => 'Vos ventes ont diminué récemment. Pensez à proposer des promotions ou à diversifier votre catalogue.',
            ];
        } else {
            $recommendations[] = [
                'icon'  => 'fas fa-equals',
                'type'  => 'info',
                'title' => 'Ventes stables',
                'text'  => 'Vos ventes sont régulières. Pour stimuler la croissance, essayez d\'ajouter des produits dans de nouvelles catégories.',
            ];
        }

        // 2. Analyse des catégories
        if (count($categories) > 1) {
            $best = $categories[0];
            $worst = $categories[count($categories) - 1];

            if ($best->total_revenue > $worst->total_revenue * 2) {
                $recommendations[] = [
                    'icon'  => 'fas fa-trophy',
                    'type'  => 'success',
                    'title' => 'Catégorie star : ' . $best->type_categorie,
                    'text'  => "Vos {$best->type_categorie}s génèrent le plus de revenus ({$best->total_revenue} €). Concentrez vos achats sur cette catégorie.",
                ];
            }

            $recommendations[] = [
                'icon'  => 'fas fa-lightbulb',
                'type'  => 'info',
                'title' => 'Diversification conseillée',
                'text'  => "La catégorie \"{$worst->type_categorie}\" est sous-exploitée. Ajouter des produits pourrait attirer de nouveaux acheteurs.",
            ];
        }

        // 3. Produits populaires en favoris
        if (count($hotProducts) > 0) {
            $topFav = $hotProducts[0];
            $recommendations[] = [
                'icon'  => 'fas fa-heart',
                'type'  => 'warning',
                'title' => 'Forte demande détectée',
                'text'  => "\"{$topFav->titre}\" est en favoris chez {$topFav->fav_count} acheteur(s). Assurez-vous d'avoir du stock suffisant.",
            ];
        }

        // 4. Stock faible
        $lowStock = DB::table('produit')
            ->where('id_vendeur', $vendeurId)
            ->where('quantite', '<=', 2)
            ->where('quantite', '>', 0)
            ->count();

        if ($lowStock > 0) {
            $recommendations[] = [
                'icon'  => 'fas fa-box-open',
                'type'  => 'warning',
                'title' => 'Alerte stock faible',
                'text'  => "{$lowStock} produit(s) ont un stock ≤ 2 unités. Réapprovisionnez pour éviter les ruptures.",
            ];
        }

        // 5. Avis et note moyenne
        try {
            $avgRating = DB::table('avis')
                ->join('produit', 'avis.id_produit', '=', 'produit.id_produit')
                ->where('produit.id_vendeur', $vendeurId)
                ->avg('avis.note');

            if ($avgRating && $avgRating >= 4) {
                $recommendations[] = [
                    'icon'  => 'fas fa-star',
                    'type'  => 'success',
                    'title' => 'Excellente réputation',
                    'text'  => "Votre note moyenne est de " . round($avgRating, 1) . "/5. Cela booste votre visibilité et la confiance des acheteurs.",
                ];
            } elseif ($avgRating && $avgRating < 3) {
                $recommendations[] = [
                    'icon'  => 'fas fa-star-half-alt',
                    'type'  => 'warning',
                    'title' => 'Améliorez vos avis',
                    'text'  => "Votre note moyenne est de " . round($avgRating, 1) . "/5. Soignez l'emballage et la communication pour améliorer la satisfaction.",
                ];
            }
        } catch (\Exception $e) {
            // Table avis peut ne pas exister
        }

        // 6. Conseil sur le timing (si des données existent)
        $n = count($monthlySales);
        if ($n >= 3) {
            $lastRevenue = $monthlySales[$n - 1]['revenue'];
            $prevRevenue = $monthlySales[$n - 2]['revenue'];

            if ($lastRevenue > $prevRevenue * 1.2) {
                $recommendations[] = [
                    'icon'  => 'fas fa-rocket',
                    'type'  => 'success',
                    'title' => 'Mois en forte hausse',
                    'text'  => 'Vos ventes du dernier mois sont en forte progression. Profitez-en pour publier de nouveaux articles.',
                ];
            }
        }

        return $recommendations;
    }

    /* ════════════════════════════════════════════════════
     *  UTILITAIRES
     * ════════════════════════════════════════════════════ */

    private function frenchMonth($month)
    {
        $months = [
            1  => 'Jan', 2  => 'Fév', 3  => 'Mar',
            4  => 'Avr', 5  => 'Mai', 6  => 'Juin',
            7  => 'Juil', 8  => 'Août', 9  => 'Sep',
            10 => 'Oct', 11 => 'Nov', 12 => 'Déc',
        ];
        return $months[$month] ?? '';
    }
}
