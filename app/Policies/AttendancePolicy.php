<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\Internship;
use App\Models\User;
use App\Services\RolePermissionService;

class AttendancePolicy
{
    public function __construct(private RolePermissionService $rolePermissions)
    {
    }

    public function record(User $user, Internship $internship): bool
    {
        return $user->isIntern() && $internship->intern_id === $user->id;
    }

    public function viewDashboard(User $user, ?string $mentorId = null): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isMentor()) {
            return $mentorId === null || $mentorId === $user->id;
        }

        return $user->isIntern();
    }

    public function correct(User $user, Attendance $attendance): bool
    {
        return $user->isAdmin() && $this->rolePermissions->isEnabled('admin', 'corriger_presences');
    }
}