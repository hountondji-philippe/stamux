<?php

namespace App\Policies;

use App\Models\Permission;
use App\Models\User;
use App\Services\RolePermissionService;

class PermissionPolicy
{
    public function __construct(private RolePermissionService $rolePermissions)
    {
    }

    public function create(User $user): bool
    {
        return $user->isIntern() && $this->rolePermissions->isEnabled('intern', 'soumettre_permission');
    }

    public function view(User $user, Permission $permission): bool
    {
        return $user->isAdmin()
            || $permission->intern_id === $user->id
            || ($user->isMentor() && $permission->internship->mentor_id === $user->id);
    }

    public function review(User $user, Permission $permission): bool
    {
        return $user->isMentor()
            && $permission->internship->mentor_id === $user->id
            && $this->rolePermissions->isEnabled('mentor', 'valider_permissions');
    }
}