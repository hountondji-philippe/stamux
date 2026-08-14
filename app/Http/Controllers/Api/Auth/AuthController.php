<?php

namespace App\Http\Controllers\Api\Auth;

use App\Actions\Auth\AcceptInvitationAction;
use App\Actions\Auth\LoginAction;
use App\Actions\Auth\LogoutAction;
use App\DTOs\AcceptInvitationData;
use App\DTOs\LoginData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\AcceptInvitationRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    public function __construct(
        private LoginAction $loginAction,
        private LogoutAction $logoutAction,
        private AcceptInvitationAction $acceptInvitationAction,
    ) {
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $throttleKey = 'login:'.$request->input('email').'|'.$request->ip();

        $user = $this->loginAction->execute(
            LoginData::fromArray($request->validated()),
            $throttleKey
        );

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ]);
    }

    public function logout(): JsonResponse
    {
        $this->logoutAction->execute(auth()->user());

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Déconnexion réussie.'],
        ]);
    }

    public function acceptInvitation(AcceptInvitationRequest $request): JsonResponse
    {
        $user = $this->acceptInvitationAction->execute(
            AcceptInvitationData::fromArray($request->validated())
        );

        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Compte activé avec succès. Vous pouvez maintenant vous connecter.',
                'user' => new UserResource($user),
            ],
        ]);
    }

    public function setupAdmin(\Illuminate\Http\Request $request): JsonResponse
    {
        $throttleKey = 'setup-admin:'.$request->ip();

        if (\Illuminate\Support\Facades\RateLimiter::tooManyAttempts($throttleKey, 5)) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'TOO_MANY_ATTEMPTS', 'message' => 'Trop de tentatives. Réessayez plus tard.'],
            ], 429);
        }

        $validated = $request->validate([
            'token' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:10', 'confirmed'],
        ]);

        $expectedToken = config('app.admin_setup_token');

        if (! $expectedToken || ! hash_equals((string) $expectedToken, $validated['token'])) {
            \Illuminate\Support\Facades\RateLimiter::hit($throttleKey, 300);
            return response()->json([
                'success' => false,
                'error' => ['code' => 'FORBIDDEN', 'message' => 'Non autorisé.'],
            ], 403);
        }

        \Illuminate\Support\Facades\RateLimiter::clear($throttleKey);

        if (\App\Models\User::where('role', \App\Enums\UserRole::Admin->value)->exists()) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'ALREADY_CONFIGURED', 'message' => 'Un compte administrateur existe deja.'],
            ], 403);
        }

        $user = \App\Models\User::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => \App\Enums\UserRole::Admin->value,
            'status' => \App\Enums\UserStatus::Active->value,
        ]);

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Compte administrateur créé avec succès.'],
        ]);
    }

    public function checkInvitation(string $token): JsonResponse
    {
        $hashedToken = hash('sha256', $token);

        $user = app(\App\Repositories\Contracts\UserRepositoryInterface::class)
            ->findByInvitationToken($hashedToken);

        if (! $user) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'INVALID_TOKEN',
                    'message' => 'Ce lien d\'invitation est invalide ou expiré.',
                ],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'email' => $this->maskEmail($user->email),
                'role' => $user->role,
            ],
        ]);
    }

    private function maskEmail(string $email): string
    {
        [$local, $domain] = explode('@', $email);

        $visible = mb_substr($local, 0, 1);
        $masked = $visible.str_repeat('*', max(mb_strlen($local) - 1, 1));

        return $masked.'@'.$domain;
    }
}