<?php

namespace App\Notifications;

use App\Enums\PermissionStatus;
use App\Models\Permission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class PermissionReviewedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Permission $permission,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $isApproved = $this->permission->status === PermissionStatus::Approved;

        return [
            'type' => 'permission_reviewed',
            'permission_id' => $this->permission->id,
            'status' => $this->permission->status->value,
            'message' => $isApproved
                ? 'Votre demande de permission a ete approuvee.'
                : 'Votre demande de permission a ete rejetee'.($this->permission->mentor_comment ? ' : '.$this->permission->mentor_comment : '.'),
        ];
    }
}