<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CommandeController extends Controller
{
    /**
     * Crée une commande à partir du panier BDD de l’acheteur, vide le panier, enregistre un paiement simulé.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_acheteur'       => 'required|integer',
            'montant_livraison' => 'nullable|numeric|min:0',
            'adresse'           => 'nullable|string|max:500',
            'telephone'         => 'nullable|string|max:40',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $idAcheteur = (int) $request->id_acheteur;
        $livraison  = (float) $request->input('montant_livraison', 0);

        try {
            $result = DB::transaction(function () use ($idAcheteur, $livraison, $request) {
                $panier = DB::table('panier')->where('id_acheteur', $idAcheteur)->first();
                if (!$panier) {
                    throw new \RuntimeException('Panier introuvable pour cet utilisateur.');
                }

                $lignes = DB::table('panier_produit')
                    ->where('id_panier', $panier->id_panier)
                    ->get();

                if ($lignes->isEmpty()) {
                    throw new \RuntimeException('Le panier en base de données est vide.');
                }

                if (! DB::table('acheteur')->where('id_user', $idAcheteur)->exists()) {
                    DB::table('acheteur')->insert([
                        'id_user'   => $idAcheteur,
                        'adresse'   => '',
                        'telephone' => '',
                    ]);
                }

                $sousTotal = 0;
                foreach ($lignes as $l) {
                    $sousTotal += (float) $l->prix_unitaire * (int) $l->quantite;
                }
                $montantTotal = round($sousTotal + $livraison, 2);

                foreach ($lignes as $l) {
                    $prod = DB::table('produit')->where('id_produit', $l->id_produit)->lockForUpdate()->first();
                    if (!$prod) {
                        throw new \RuntimeException('Produit introuvable : ' . $l->id_produit);
                    }
                    if ((int) $prod->quantite < (int) $l->quantite) {
                        throw new \RuntimeException('Stock insuffisant pour : ' . ($prod->titre ?? $l->id_produit));
                    }
                }

                $idCommande = DB::table('commande')->insertGetId([
                    'id_acheteur'   => $idAcheteur,
                    'id_panier'     => $panier->id_panier,
                    'statut'        => 'EN_ATTENTE',
                    'montant_total' => $montantTotal,
                    'date_commande' => now(),
                ]);

                foreach ($lignes as $l) {
                    DB::table('commande_produit')->insert([
                        'id_commande'   => $idCommande,
                        'id_produit'    => $l->id_produit,
                        'quantite'      => $l->quantite,
                        'prix_unitaire' => $l->prix_unitaire,
                        'statut'        => 'EN_PREPARATION',
                    ]);

                    DB::table('produit')
                        ->where('id_produit', $l->id_produit)
                        ->decrement('quantite', (int) $l->quantite);
                }

                DB::table('paiement')->insert([
                    'id_commande'   => $idCommande,
                    'montant'       => $montantTotal,
                    'mode_paiement' => 'SIMULATION',
                    'statut'        => 'VALIDE',
                    'date_paiement' => now(),
                ]);

                DB::table('panier_produit')->where('id_panier', $panier->id_panier)->delete();
                // DB::table('panier')->where('id_panier', $panier->id_panier)->delete(); // Modifié : On garde le panier, on supprime seulement son contenu

                if ($request->filled('adresse') || $request->filled('telephone')) {
                    $upd = [];
                    if ($request->filled('adresse')) {
                        $upd['adresse'] = $request->adresse;
                    }
                    if ($request->filled('telephone')) {
                        $upd['telephone'] = $request->telephone;
                    }
                    if ($upd !== []) {
                        $upd['id_user'] = $idAcheteur;
                        DB::table('acheteur')->updateOrInsert(['id_user' => $idAcheteur], $upd);
                    }
                }

                return ['id_commande' => $idCommande, 'montant_total' => $montantTotal];
            });

            return response()->json([
                'message'       => 'Commande enregistrée. Le vendeur va la valider.',
                'id_commande'   => $result['id_commande'],
                'montant_total' => $result['montant_total'],
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            report($e);

            return response()->json(['message' => 'Erreur lors de la commande.'], 500);
        }
    }
    public function cancel($acheteurId, $orderId)
    {
        try {
            $result = DB::transaction(function () use ($acheteurId, $orderId) {
                // Vérifier la commande
                $commande = DB::table('commande')
                    ->where('id_commande', $orderId)
                    ->where('id_acheteur', $acheteurId)
                    ->lockForUpdate()
                    ->first();

                if (!$commande) {
                    throw new \RuntimeException('Commande introuvable ou non autorisée.');
                }

                if ($commande->statut !== 'EN_ATTENTE') {
                    throw new \RuntimeException('Seule une commande en attente peut être annulée.');
                }

                // Récupérer les lignes de commande
                $lignes = DB::table('commande_produit')
                    ->where('id_commande', $orderId)
                    ->get();

                // Restaurer les stocks
                foreach ($lignes as $l) {
                    DB::table('produit')
                        ->where('id_produit', $l->id_produit)
                        ->increment('quantite', (int) $l->quantite);
                }

                // Mettre à jour les statuts
                DB::table('commande')
                    ->where('id_commande', $orderId)
                    ->update(['statut' => 'ANNULEE']);
                
                DB::table('commande_produit')
                    ->where('id_commande', $orderId)
                    ->update(['statut' => 'ANNULE']);

                // Annuler le paiement associé s'il y en a un
                DB::table('paiement')
                    ->where('id_commande', $orderId)
                    ->update(['statut' => 'ECHOUE']);

                return true;
            });

            return response()->json(['message' => 'Commande annulée avec succès.']);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['message' => 'Erreur lors de l\'annulation.'], 500);
        }
    }
}
