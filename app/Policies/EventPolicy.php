<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;
use App\Services\RolePermissionService;

class EventPolicy
{
    public function __construct(private RolePermissionService $rolePermissions)
    {
    }

    public function publish(User $user): bool
    {
        return $user->isAdmin() && $this->rolePermissions->isEnabled('admin', 'publier_evenements');
    }

    public function update(User $user, Event $event): bool
    {
        return $user->isAdmin() && $this->rolePermissions->isEnabled('admin', 'publier_evenements');
    }

    public function delete(User $user, Event $event): bool
    {
        return $user->isAdmin() && $this->rolePermissions->isEnabled('admin', 'publier_evenements');
    }
}