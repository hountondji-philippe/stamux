<?php

namespace App\Policies;

use App\Models\User;
use App\Services\RolePermissionService;

class UserPolicy
{
    public function __construct(private RolePermissionService $rolePermissions)
    {
    }

    public function manage(User $user): bool
    {
        return $user->isAdmin() && $this->rolePermissions->isEnabled('admin', 'gerer_utilisateurs');
    }

    public function viewGlobalStats(User $user): bool
    {
        return $user->isAdmin() && $this->rolePermissions->isEnabled('admin', 'voir_statistiques');
    }
}