<?php

namespace App\Policies;

use App\Enums\ReportStatus;
use App\Models\Report;
use App\Models\User;
use App\Services\RolePermissionService;

class ReportPolicy
{
    public function __construct(private RolePermissionService $rolePermissions)
    {
    }

    public function submit(User $user): bool
    {
        return $user->isIntern() && $this->rolePermissions->isEnabled('intern', 'deposer_rapport');
    }

    public function view(User $user, Report $report): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        if ($user->id === $report->intern_id) {
            return true;
        }
        return $user->isMentor() && $report->internship?->mentor_id === $user->id;
    }

    public function validate(User $user, Report $report): bool
    {
        $report->loadMissing('internship');
        return $user->isMentor()
            && $report->internship->mentor_id === $user->id
            && $this->rolePermissions->isEnabled('mentor', 'valider_rapports');
    }

    public function update(User $user, Report $report): bool
    {
        $status = $report->status instanceof ReportStatus
            ? $report->status->value
            : $report->status;
        return $user->id === $report->intern_id
            && $status !== ReportStatus::Validated->value;
    }

    public function delete(User $user, Report $report): bool
    {
        if ($user->id === $report->intern_id) {
            return true;
        }

        $report->loadMissing('internship');
        return $user->isMentor() && $report->internship?->mentor_id === $user->id;
    }

    public function download(User $user, Report $report): bool
    {
        return $this->view($user, $report);
    }
}