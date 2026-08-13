<?php

namespace App\Actions\Permission;

use App\DTOs\PermissionData;
use App\Enums\PermissionStatus;
use App\Exceptions\OverlappingPermissionException;
use App\Models\Permission;
use App\Notifications\PermissionRequestedNotification;
use App\Repositories\Contracts\InternshipRepositoryInterface;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use Illuminate\Support\Str;

class RequestPermissionAction
{
    public function __construct(
        private PermissionRepositoryInterface $permissions,
        private InternshipRepositoryInterface $internships,
    ) {
    }

    public function execute(PermissionData $data): Permission
    {
        if ($this->permissions->hasOverlappingRequest($data->internId, $data->startDate, $data->endDate)) {
            throw new OverlappingPermissionException(
                'Une demande de permission existe deja sur cette periode.'
            );
        }

        $permission = $this->permissions->create([
            'id' => (string) Str::uuid(),
            'intern_id' => $data->internId,
            'internship_id' => $data->internshipId,
            'start_date' => $data->startDate,
            'end_date' => $data->endDate,
            'reason' => $data->reason,
            'status' => PermissionStatus::Pending->value,
        ]);

        $permission->loadMissing('internship.mentor', 'intern');

        if ($permission->internship->mentor) {
            $permission->internship->mentor->notify(new PermissionRequestedNotification($permission));
        }

        return $permission;
    }
}