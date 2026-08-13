<?php

namespace App\Notifications;

use App\Models\Permission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class PermissionRequestedNotification extends Notification implements ShouldQueue
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
        return [
            'type' => 'permission_requested',
            'permission_id' => $this->permission->id,
            'intern_name' => $this->permission->intern->name,
            'message' => $this->permission->intern->name.' a demande une permission du '
                .$this->permission->start_date->format('d/m/Y').' au '
                .$this->permission->end_date->format('d/m/Y').'.',
        ];
    }
}