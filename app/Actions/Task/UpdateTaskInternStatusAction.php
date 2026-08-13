<?php
namespace App\Actions\Task;
use App\DTOs\UpdateTaskInternStatusData;
use App\Enums\TaskStatus;
use App\Exceptions\InternNotAssignedToMentorException;
use App\Models\TaskIntern;
use App\Notifications\TaskStatusUpdatedNotification;
use App\Repositories\Contracts\TaskRepositoryInterface;
class UpdateTaskInternStatusAction
{
    public function __construct(
        private TaskRepositoryInterface $tasks,
    ) {
    }
    public function execute(UpdateTaskInternStatusData $data): TaskIntern
    {
        $pivot = TaskIntern::where('task_id', $data->taskId)
            ->where('intern_id', $data->internId)
            ->first();
        if (! $pivot) {
            throw new InternNotAssignedToMentorException(
                'Vous n\'êtes pas assigné à cette tâche.'
            );
        }
        $pivot->update([
            'status' => $data->status->value,
            'completed_at' => $data->status === TaskStatus::Done ? now() : null,
        ]);
        $pivot->loadMissing('task.project.mentor', 'intern');
        if ($pivot->task->project->mentor) {
            $pivot->task->project->mentor->notify(
                new TaskStatusUpdatedNotification($pivot->task, $pivot->intern, $data->status)
            );
        }
        return $pivot->fresh();
    }
}