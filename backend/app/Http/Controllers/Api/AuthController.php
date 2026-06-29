<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authentifier un utilisateur et générer un token Sanctum.
     * 
     * Rate limiting : 5 tentatives par minute par couple (email + IP).
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // 🛡️ Vérifie le rate limiting AVANT la tentative
        $throttleKey = $this->throttleKey($request);

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => ["Trop de tentatives. Réessayez dans {$seconds} secondes."],
            ]);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            // 🛡️ Incrémente le compteur d'échecs (bloque 60s après 5 essais)
            RateLimiter::hit($throttleKey, 60);

            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        // 🛡️ Reset le compteur sur succès
        RateLimiter::clear($throttleKey);

        $token = $user->createToken('shadi-phone-app')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Retourner l'utilisateur actuellement authentifié.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    /**
     * Révoquer le token courant (déconnexion).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    /**
     * Permet à l'utilisateur connecté de changer son mot de passe.
     * Désactive aussi le flag must_change_password.
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'password' => Hash::make($request->validated('new_password')),
            'must_change_password' => false,
        ]);

        return response()->json([
            'message' => 'Mot de passe changé avec succès',
            'must_change_password' => false,
        ]);
    }

    /**
     * Clé unique pour le rate limiting (basée sur email + IP).
     * Permet de bloquer une combinaison spécifique sans bloquer toute l'IP.
     */
    private function throttleKey(Request $request): string
    {
        return strtolower($request->input('email', '')) . '|' . $request->ip();
    }
}