<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class VisitorController extends Controller
{
    /**
     * POST /api/visitor/avis — Visitor leaves a review
     */
    public function storeReview(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_produit'  => 'required|integer',
            'visitor_id'  => 'required|string|max:64',
            'pseudo'      => 'sometimes|string|max:100',
            'note'        => 'required|integer|min:1|max:5',
            'commentaire' => 'sometimes|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check product exists
        $product = DB::table('produit')->where('id_produit', $request->id_produit)->first();
        if (!$product) {
            return response()->json(['message' => 'Produit non trouvé'], 404);
        }

        $id = DB::table('avis_visiteur')->insertGetId([
            'id_produit'  => $request->id_produit,
            'visitor_id'  => $request->visitor_id,
            'pseudo'      => $request->pseudo ?? 'Visiteur',
            'note'        => $request->note,
            'commentaire' => $request->commentaire,
            'date_avis'   => now(),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        // Also log as activity
        DB::table('visitor_activities')->insert([
            'visitor_id'  => $request->visitor_id,
            'type'        => 'review',
            'label'       => "Avis laissé sur « {$product->titre} » ({$request->note}/5)",
            'id_produit'  => $request->id_produit,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        return response()->json([
            'message'  => 'Avis enregistré avec succès',
            'id_avis'  => $id,
        ], 201);
    }

    /**
     * GET /api/visitor/avis/{id_produit} — Get all reviews for a product (both registered + visitor)
     */
    public function getReviews($id_produit)
    {
        // Registered user reviews
        $userReviews = DB::table('avis')
            ->join('users', 'avis.id_user', '=', 'users.id_user')
            ->where('avis.id_produit', $id_produit)
            ->select(
                'avis.id_avis',
                'avis.note',
                'avis.commentaire',
                'avis.date_avis',
                DB::raw("CONCAT(users.prenom, ' ', LEFT(users.nom, 1), '.') as pseudo"),
                DB::raw("'registered' as source")
            )
            ->get();

        // Visitor reviews
        $visitorReviews = DB::table('avis_visiteur')
            ->where('id_produit', $id_produit)
            ->select(
                'id_avis',
                'note',
                'commentaire',
                'date_avis',
                'pseudo',
                DB::raw("'visitor' as source")
            )
            ->get();

        // Merge and sort by date desc
        $all = $userReviews->merge($visitorReviews)
            ->sortByDesc('date_avis')
            ->values();

        // Average rating
        $avgNote = $all->avg('note');

        return response()->json([
            'reviews'  => $all,
            'count'    => $all->count(),
            'average'  => round($avgNote, 1),
        ]);
    }

    /**
     * POST /api/visitor/activity — Log a visitor activity
     */
    public function logActivity(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'visitor_id'  => 'required|string|max:64',
            'type'        => 'required|string|max:50',
            'label'       => 'sometimes|string|max:255',
            'id_produit'  => 'sometimes|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::table('visitor_activities')->insert([
            'visitor_id'  => $request->visitor_id,
            'type'        => $request->type,
            'label'       => $request->label ?? '',
            'id_produit'  => $request->id_produit,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        return response()->json(['message' => 'Activité enregistrée'], 201);
    }

    /**
     * GET /api/visitor/activity/{visitor_id} — Get visitor activities
     */
    public function getActivities($visitor_id)
    {
        $activities = DB::table('visitor_activities')
            ->where('visitor_id', $visitor_id)
            ->leftJoin('produit', 'visitor_activities.id_produit', '=', 'produit.id_produit')
            ->select(
                'visitor_activities.*',
                'produit.titre as produit_titre'
            )
            ->orderBy('visitor_activities.created_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json($activities);
    }

    /**
     * GET /api/vendeurs/{id}/boutique — Get seller shop info + products
     */
    public function getSellerShop($id)
    {
        $seller = DB::table('vendeur')
            ->join('users', 'vendeur.id_user', '=', 'users.id_user')
            ->where('vendeur.id_user', $id)
            ->select(
                'vendeur.*',
                'users.nom',
                'users.prenom',
                'users.email'
            )
            ->first();

        if (!$seller) {
            return response()->json(['message' => 'Vendeur non trouvé'], 404);
        }

        $products = DB::table('produit')
            ->join('categorie', 'produit.id_categorie', '=', 'categorie.id_categorie')
            ->leftJoin('produit_photo', function($join) {
                $join->on('produit.id_produit', '=', 'produit_photo.id_produit')
                     ->whereRaw('produit_photo.id_photo = (SELECT MIN(id_photo) FROM produit_photo WHERE id_produit = produit.id_produit)');
            })
            ->where('produit.id_vendeur', $id)
            ->where(function($q) {
                $q->where('produit.statut', 'VALIDEE')
                  ->orWhereExists(function($sub) {
                      $sub->select(DB::raw(1))
                          ->from('annonce_produit')
                          ->join('annonce', 'annonce_produit.id_annonce', '=', 'annonce.id_annonce')
                          ->whereRaw('annonce_produit.id_produit = produit.id_produit')
                          ->where('annonce.statut', 'VALIDEE');
                  });
            })
            ->select(
                'produit.*',
                'categorie.nom as categorie_nom',
                'produit_photo.chemin as photo_principale'
            )
            ->orderBy('produit.date_ajout', 'desc')
            ->get();

        // Count reviews for this seller's products
        $productIds = $products->pluck('id_produit');
        $reviewCount = DB::table('avis_visiteur')
            ->whereIn('id_produit', $productIds)
            ->count();
        $reviewCount += DB::table('avis')
            ->whereIn('id_produit', $productIds)
            ->count();

        return response()->json([
            'seller'       => $seller,
            'products'     => $products,
            'review_count' => $reviewCount,
        ]);
    }

    /**
     * GET /api/produits/{id}/details — Get full product details with seller info, photos, reviews
     */
    public function getProductFull($id)
    {
        $product = DB::table('produit')
            ->join('categorie', 'produit.id_categorie', '=', 'categorie.id_categorie')
            ->select('produit.*', 'categorie.nom as categorie_nom')
            ->where('produit.id_produit', $id)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Produit non trouvé'], 404);
        }

        // Seller info
        $seller = DB::table('vendeur')
            ->join('users', 'vendeur.id_user', '=', 'users.id_user')
            ->where('vendeur.id_user', $product->id_vendeur)
            ->select('vendeur.*', 'users.nom', 'users.prenom')
            ->first();

        // Photos
        $photos = DB::table('produit_photo')
            ->where('id_produit', $id)
            ->orderBy('id_photo')
            ->get();

        // Specialized data
        $details = null;
        if ($product->id_categorie == 3) $details = DB::table('vinyle')->where('id_produit', $id)->first();
        elseif ($product->id_categorie == 1) $details = DB::table('cds')->where('id_produit', $id)->first();
        elseif ($product->id_categorie == 2) $details = DB::table('cassette')->where('id_produit', $id)->first();

        // Reviews (both registered + visitor)
        $userReviews = DB::table('avis')
            ->join('users', 'avis.id_user', '=', 'users.id_user')
            ->where('avis.id_produit', $id)
            ->select(
                'avis.id_avis', 'avis.note', 'avis.commentaire', 'avis.date_avis',
                DB::raw("CONCAT(users.prenom, ' ', LEFT(users.nom, 1), '.') as pseudo"),
                DB::raw("'registered' as source")
            )->get();

        $visitorReviews = DB::table('avis_visiteur')
            ->where('id_produit', $id)
            ->select('id_avis', 'note', 'commentaire', 'date_avis', 'pseudo', DB::raw("'visitor' as source"))
            ->get();

        $allReviews = $userReviews->merge($visitorReviews)->sortByDesc('date_avis')->values();

        return response()->json([
            'product' => $product,
            'seller'  => $seller,
            'photos'  => $photos,
            'details' => $details,
            'reviews' => [
                'list'    => $allReviews,
                'count'   => $allReviews->count(),
                'average' => $allReviews->count() > 0 ? round($allReviews->avg('note'), 1) : 0,
            ],
        ]);
    }
}
