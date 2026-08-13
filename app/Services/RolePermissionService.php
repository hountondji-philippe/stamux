<?php

namespace App\Services;

use App\Models\RolePermission;
use Illuminate\Support\Facades\Cache;

class RolePermissionService
{
    /**
     * Verifie si une permission est activee pour un role.
     * Par defaut true si la ligne n'existe pas (fail-open) pour ne jamais
     * bloquer une action qui marchait deja avant l'ajout de ce systeme.
     */
    public function isEnabled(string $role, string $key): bool
    {
        return Cache::remember(
            "role_permission:{$role}:{$key}",
            300,
            function () use ($role, $key) {
                $row = RolePermission::where('role', $role)
                    ->where('permission_key', $key)
                    ->first();

                return $row?->enabled ?? true;
            }
        );
    }

    public function clearCache(string $role, string $key): void
    {
        Cache::forget("role_permission:{$role}:{$key}");
    }
}