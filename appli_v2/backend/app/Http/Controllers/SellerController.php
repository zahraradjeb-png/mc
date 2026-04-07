<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class SellerController extends Controller
{
    /**
     * Update the seller's shop profile.
     */
    public function updateProfile(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nom_boutique' => 'required|string|max:200',
            'description'  => 'nullable|string',
            'localisation' => 'nullable|string',
            'categorie_principale' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Mettre à jour la table vendeur
        DB::table('vendeur')->where('id_user', $id)->update([
            'nom_boutique' => $request->nom_boutique,
            'description'  => $request->description,
            'localisation' => $request->localisation,
            'categorie_principale' => $request->categorie_principale,
        ]);

        return response()->json([
            'message' => 'Profil de la boutique mis à jour avec succès !',
            'updated' => [
                'shopName'     => $request->nom_boutique,
                'shopBio'      => $request->description,
                'shopLocation' => $request->localisation,
                'shopCategory' => $request->categorie_principale,
            ]
        ]);
    }

    /**
     * Upload a profile photo.
     */
    public function uploadPhoto(Request $request, $id)
    {
        $request->validate([
            'photo_profil' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('photo_profil')) {
            $photo = $request->file('photo_profil');
            $filename = 'profile_' . $id . '_' . time() . '.' . $photo->getClientOriginalExtension();
            $photo->move(public_path('uploads/profiles'), $filename);
            $path = 'uploads/profiles/' . $filename;

            // Update DB
            DB::table('vendeur')->where('id_user', $id)->update([
                'photo_profil' => $path
            ]);

            return response()->json([
                'message' => 'Photo de profil mise à jour !',
                'photo_url' => $path
            ]);
        }

        return response()->json(['message' => 'Aucun fichier reçu.'], 400);
    }

    /**
     * Get seller reviews.
     */
    /**
     * Get seller reviews.
     */
    public function getReviews($id)
    {
        // On vérifie d'abord si la table avis existe pour éviter une erreur 500
        try {
            $reviews = DB::table('avis')
                ->join('users', 'avis.id_user', '=', 'users.id_user')
                ->join('produit', 'avis.id_produit', '=', 'produit.id_produit')
                ->select('avis.*', 'users.prenom', 'users.nom', 'produit.titre as produit_titre')
                ->where('produit.id_vendeur', $id)
                ->orderBy('avis.date_avis', 'desc')
                ->get();

            return response()->json($reviews);
        } catch (\Exception $e) {
            // Si la table n'existe pas encore ou autre erreur
            return response()->json([]);
        }
    }

    /**
     * Get seller's specific order items.
     */
    public function getOrders($id)
    {
        $items = DB::table('commande_produit')
            ->join('commande', 'commande_produit.id_commande', '=', 'commande.id_commande')
            ->join('produit', 'commande_produit.id_produit', '=', 'produit.id_produit')
            ->join('users', 'commande.id_acheteur', '=', 'users.id_user')
            ->leftJoin('acheteur', 'users.id_user', '=', 'acheteur.id_user')
            ->where('produit.id_vendeur', $id)
            ->select(
                'commande.id_commande',
                'commande.date_commande',
                'commande_produit.id_produit',
                'commande_produit.quantite',
                'commande_produit.prix_unitaire',
                'commande_produit.statut as statut_item',
                'produit.titre',
                'users.prenom as acheteur_prenom',
                'users.nom as acheteur_nom',
                'acheteur.adresse as acheteur_adresse',
                'acheteur.telephone as acheteur_tel'
            )
            ->orderBy('commande.date_commande', 'desc')
            ->get();

        return response()->json($items);
    }


    /**
     * Update the status of a specific item in an order.
     */
    public function updateOrderItemStatus(Request $request, $vendeurId, $orderId, $productId)
    {
        $request->validate([
            'statut' => 'required|in:EN_PREPARATION,EXPEDIE,LIVRE,ANNULE'
        ]);

        // Verifier que le produit appartient bien au vendeur
        $product = DB::table('produit')
            ->where('id_produit', $productId)
            ->where('id_vendeur', $vendeurId)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Produit non trouvé pour ce vendeur.'], 403);
        }

        DB::table('commande_produit')
            ->where('id_commande', $orderId)
            ->where('id_produit', $productId)
            ->update(['statut' => $request->statut]);

        return response()->json(['message' => 'Statut de l\'article mis à jour !']);
    }

    /**
     * Get real-time stats for the seller dashboard.
     */
    public function getStats($id)
    {
        // 1. Total Products
        $totalProducts = DB::table('produit')->where('id_vendeur', $id)->count();

        // 2. Pending Orders (Items in 'EN_PREPARATION')
        $pendingOrders = DB::table('commande_produit')
            ->join('produit', 'commande_produit.id_produit', '=', 'produit.id_produit')
            ->where('produit.id_vendeur', $id)
            ->where('commande_produit.statut', 'EN_PREPARATION')
            ->count();

        // 3. Monthly Revenue (Price * Quantity for all completed sales this month)
        // For simplicity: all items that are NOT CANCELLED and from this month
        $monthRevenue = DB::table('commande_produit')
            ->join('produit', 'commande_produit.id_produit', '=', 'produit.id_produit')
            ->join('commande', 'commande_produit.id_commande', '=', 'commande.id_commande')
            ->where('produit.id_vendeur', $id)
            ->where('commande_produit.statut', '!=', 'ANNULE')
            ->whereMonth('commande.date_commande', now()->month)
            ->sum(DB::raw('commande_produit.prix_unitaire * commande_produit.quantite'));

        // 5. Total Orders (at least one item in any order)
        $totalOrdersCount = DB::table('commande_produit')
            ->join('produit', 'commande_produit.id_produit', '=', 'produit.id_produit')
            ->where('produit.id_vendeur', $id)
            ->distinct('commande_produit.id_commande')
            ->count('commande_produit.id_commande');

        // 4. Avg Rating
        $avgRatingArr = DB::table('avis')
            ->join('produit', 'avis.id_produit', '=', 'produit.id_produit')
            ->where('produit.id_vendeur', $id)
            ->select(DB::raw('AVG(note) as average'))
            ->first();

        $avgRating = ($avgRatingArr && $avgRatingArr->average) ? round($avgRatingArr->average, 1) : 0;

        return response()->json([
            'total_products' => $totalProducts,
            'pending_orders' => $pendingOrders,
            'month_revenue'  => number_format($monthRevenue, 2, ',', ' '),
            'avg_rating'     => $avgRating,
            'total_orders'   => $totalOrdersCount
        ]);
    }

    /**
     * Get seller's finance stats and history.
     */
    public function getFinance($id)
    {
        // 1. Calculations
        $commissionRate = 0.08;

        // Current Balance (Non-cancelled items * (1 - 0.08))
        $totalEarned = DB::table('commande_produit')
            ->join('produit', 'commande_produit.id_produit', '=', 'produit.id_produit')
            ->where('produit.id_vendeur', $id)
            ->where('commande_produit.statut', '!=', 'ANNULE')
            ->sum(DB::raw('commande_produit.prix_unitaire * commande_produit.quantite'));

        $netBalance = $totalEarned * (1 - $commissionRate);

        // Gross Revenue last 30 days
        $gross30Days = DB::table('commande_produit')
            ->join('produit', 'commande_produit.id_produit', '=', 'produit.id_produit')
            ->join('commande', 'commande_produit.id_commande', '=', 'commande.id_commande')
            ->where('produit.id_vendeur', $id)
            ->where('commande_produit.statut', '!=', 'ANNULE')
            ->where('commande.date_commande', '>=', now()->subDays(30))
            ->sum(DB::raw('commande_produit.prix_unitaire * commande_produit.quantite'));

        $fees30Days = $gross30Days * $commissionRate;

        // Transactions History
        $transactions = DB::table('commande_produit')
            ->join('commande', 'commande_produit.id_commande', '=', 'commande.id_commande')
            ->join('produit', 'commande_produit.id_produit', '=', 'produit.id_produit')
            ->where('produit.id_vendeur', $id)
            ->select(
                'commande.date_commande',
                'commande.id_commande',
                'produit.titre',
                'commande_produit.prix_unitaire',
                'commande_produit.quantite',
                'commande_produit.statut as statut_item'
            )
            ->orderBy('commande.date_commande', 'desc')
            ->limit(50)
            ->get()
            ->map(function($t) use ($commissionRate) {
                $brut = $t->prix_unitaire * $t->quantite;
                $frais = $brut * $commissionRate;
                $net = $brut - $frais;
                return [
                    'date' => date('d/m/Y, H:i', strtotime($t->date_commande)),
                    'desc' => "Vente - " . $t->titre . " (#ORD-" . $t->id_commande . ")",
                    'brut' => number_format($brut, 2, ',', ' '),
                    'frais' => number_format($frais, 2, ',', ' '),
                    'net' => number_format($net, 2, ',', ' '),
                    'statut' => $t->statut_item
                ];
            });

        return response()->json([
            'balance'         => number_format($netBalance, 2, ',', ' '),
            'gross_30d'       => number_format($gross30Days, 2, ',', ' '),
            'fees_30d'        => number_format($fees30Days, 2, ',', ' '),
            'transactions'    => $transactions,
            'total_orders'    => count($transactions)
        ]);
    }

    /**
     * Update seller password.
     */
    public function updatePassword(Request $request, $id)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password'     => 'required|min:6'
        ]);

        $user = DB::table('users')->where('id_user', $id)->first();

        if (!$user || !Hash::check($request->current_password, $user->mdp)) {
            return response()->json(['message' => 'L\'ancien mot de passe est incorrect.'], 403);
        }

        DB::table('users')->where('id_user', $id)->update([
            'mdp' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Le mot de passe a été mis à jour avec succès !']);
    }
}
