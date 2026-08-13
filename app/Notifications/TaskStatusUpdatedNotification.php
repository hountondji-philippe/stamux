<?php
namespace App\Notifications;
use App\Models\Task;
use App\Models\User;
use App\Enums\TaskStatus;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
class TaskStatusUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    public function __construct(
        public Task $task,
        public User $intern,
        public TaskStatus $status,
    ) {
    }
    public function via(object $notifiable): array
    {
        return ['database'];
    }
    public function toDatabase(object $notifiable): array
    {
        $statusLabels = [
            'todo' => 'À faire',
            'in_progress' => 'En cours',
            'done' => 'Terminée',
        ];
        $label = $statusLabels[$this->status->value] ?? $this->status->value;
        return [
            'type' => 'task_status_updated',
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'new_status' => $this->status->value,
            'message' => $this->intern->name.' a mis à jour la tâche "'.$this->task->title.'" : '.$label,
        ];
    }
}