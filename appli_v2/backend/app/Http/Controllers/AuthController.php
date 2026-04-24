<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function inscription(Request $request)
    {
        // Validation
        $request->validate([
            'nom'    => 'required',
            'prenom' => 'required',
            'email'  => 'required|email|unique:users,email',
            'mdp'    => 'required|min:6',
            'role'   => 'required|in:ACHETEUR,VENDEUR'
        ]);

        // Créer l'utilisateur
        $id = DB::table('users')->insertGetId([
            'nom'    => $request->nom,
            'prenom' => $request->prenom,
            'email'  => $request->email,
            'mdp'    => Hash::make($request->mdp),
            'role'   => $request->role
        ]);

        // Si vendeur → créer entrée dans table vendeur
        if ($request->role === 'VENDEUR') {
            DB::table('vendeur')->insert([
                'id_user'              => $id,
                'nom_boutique'         => $request->nom_boutique ?? 'Ma Boutique',
                'description'          => $request->description ?? '',
                'categorie_principale' => $request->categorie_principale ?? '',
                'localisation'         => $request->localisation ?? ''
            ]);
        }

        // Si acheteur → créer entrée dans table acheteur
        if ($request->role === 'ACHETEUR') {
            DB::table('acheteur')->insert([
                'id_user'   => $id,
                'adresse'   => $request->adresse ?? '',
                'telephone' => $request->telephone ?? ''
            ]);
        }

        return response()->json([
            'message' => 'Inscription réussie !',
            'user_id' => $id
        ], 201);
    }


    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'mdp'   => 'required'
        ]);

        $user = DB::table('users')
                    ->where('email', $request->email)
                    ->first();

        if (!$user || !Hash::check($request->mdp, $user->mdp)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        $idValue = $user->id_user ?? $user->id ?? 0;
        $userData = [
            'id'      => $idValue,
            'id_user' => $idValue,
            'nom'     => $user->nom,
            'prenom'  => $user->prenom,
            'email'   => $user->email,
            'role'    => $user->role
        ];

        // Si vendeur, récupérer ses infos spécifiques
        if ($user->role === 'VENDEUR') {
            $vendeur = DB::table('vendeur')->where('id_user', $user->id_user)->first();
            if ($vendeur) {
                $userData['nom_boutique'] = $vendeur->nom_boutique;
                $userData['description']  = $vendeur->description;
                $userData['categorie_principale'] = $vendeur->categorie_principale;
                $userData['localisation'] = $vendeur->localisation;
                $userData['photo_profil'] = $vendeur->photo_profil;
            }
        }

        return response()->json([
            'message' => 'Connexion réussie !',
            'user'    => $userData
        ], 200);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'nouveau_mdp' => 'required|min:6'
        ]);

        $user = DB::table('users')->where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        DB::table('users')->where('email', $request->email)->update([
            'mdp' => Hash::make($request->nouveau_mdp)
        ]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.'], 200);
    }

    public function updateProfile(Request $request, $id)
    {
        $request->validate([
            'nom'    => 'required',
            'prenom' => 'required',
            'email'  => 'required|email'
        ]);

        DB::table('users')->where('id_user', $id)->update([
            'nom'    => $request->nom,
            'prenom' => $request->prenom,
            'email'  => $request->email,
            'bio'    => $request->bio ?? ''
        ]);

        // On renvoie les nouvelles infos pour mettre à jour le localStorage
        $user = DB::table('users')->where('id_user', $id)->first();

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => [
                'id' => $user->id_user ?? $user->id ?? 0,
                'id_user' => $user->id_user ?? $user->id ?? 0,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'role' => $user->role,
                'bio' => $user->bio
            ]
        ]);
    }

    public function switchRole($id)
    {
        $user = DB::table('users')->where('id_user', $id)->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $newRole = $user->role === 'VENDEUR' ? 'ACHETEUR' : 'VENDEUR';

        // S'il bascule vers Vendeur, on lui crée un profil Vendeur par défaut s'il n'existe pas
        if ($newRole === 'VENDEUR') {
            $exists = DB::table('vendeur')->where('id_user', $id)->exists();
            if (!$exists) {
                DB::table('vendeur')->insert([
                    'id_user'              => $id,
                    'nom_boutique'         => $user->prenom . ' ' . $user->nom . ' Boutique',
                    'description'          => '',
                    'categorie_principale' => 'Vinyles',
                    'localisation'         => ''
                ]);
            }
        }

        // S'il bascule vers Acheteur, on lui crée un profil Acheteur par défaut s'il n'existe pas
        if ($newRole === 'ACHETEUR') {
            $exists = DB::table('acheteur')->where('id_user', $id)->exists();
            if (!$exists) {
                DB::table('acheteur')->insert([
                    'id_user'   => $id,
                    'adresse'   => '',
                    'telephone' => ''
                ]);
            }
        }

        DB::table('users')->where('id_user', $id)->update(['role' => $newRole]);

        // On renvoie l'utilisateur mis à jour pour le localStorage
        $userData = [
            'id'      => $id,
            'id_user' => $id,
            'nom'     => $user->nom,
            'prenom'  => $user->prenom,
            'email'   => $user->email,
            'role'    => $newRole
        ];

        // Ajouter infos spécifiques au mode Vendeur
        if ($newRole === 'VENDEUR') {
            $vendeur = DB::table('vendeur')->where('id_user', $id)->first();
            if ($vendeur) {
                $userData['nom_boutique'] = $vendeur->nom_boutique;
                $userData['description']  = $vendeur->description;
                $userData['categorie_principale'] = $vendeur->categorie_principale;
                $userData['localisation'] = $vendeur->localisation;
                $userData['photo_profil'] = $vendeur->photo_profil ?? null;
            }
        }

        return response()->json([
            'message' => 'Rôle mis à jour',
            'user'    => $userData
        ], 200);
    }
}