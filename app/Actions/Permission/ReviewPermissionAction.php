<?php

namespace App\Actions\Permission;

use App\Enums\AttendanceStatus;
use App\Enums\PermissionStatus;
use App\Exceptions\PermissionAlreadyReviewedException;
use App\Models\Permission;
use App\Models\User;
use App\Notifications\PermissionReviewedNotification;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use Illuminate\Support\Str;

class ReviewPermissionAction
{
    public function __construct(
        private PermissionRepositoryInterface $permissions,
        private AttendanceRepositoryInterface $attendances,
    ) {
    }

    public function execute(Permission $permission, User $reviewer, PermissionStatus $status, ?string $comment): Permission
    {
        if ($permission->status !== PermissionStatus::Pending) {
            throw new PermissionAlreadyReviewedException('Cette demande de permission a deja ete traitee.');
        }

        $updated = $this->permissions->update($permission, [
            'status' => $status->value,
            'mentor_comment' => $comment,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
        ]);

        if ($status === PermissionStatus::Approved) {
            $this->createAttendanceForRange($updated);
        }

        $updated->loadMissing('intern');
        $updated->intern->notify(new PermissionReviewedNotification($updated));

        return $updated;
    }

    private function createAttendanceForRange(Permission $permission): void
    {
        $date = $permission->start_date->copy();

        while ($date->lte($permission->end_date)) {
            if (! $this->attendances->existsForDate($permission->intern_id, $date->toDateString())) {
                $this->attendances->create([
                    'id' => (string) Str::uuid(),
                    'intern_id' => $permission->intern_id,
                    'internship_id' => $permission->internship_id,
                    'date' => $date->toDateString(),
                    'status' => AttendanceStatus::Permission->value,
                    'note' => 'Permission approuvee : '.$permission->reason,
                ]);
            }
            $date->addDay();
        }
    }
}