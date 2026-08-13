<?php
namespace App\Actions\Task;
use App\DTOs\TaskData;
use App\Enums\TaskStatus;
use App\Exceptions\InternNotAssignedToMentorException;
use App\Models\Task;
use App\Notifications\TaskAssignedNotification;
use App\Repositories\Contracts\ProjectRepositoryInterface;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Illuminate\Support\Str;
class CreateTaskAction
{
    public function __construct(
        private TaskRepositoryInterface $tasks,
        private ProjectRepositoryInterface $projects,
    ) {
    }
    public function execute(TaskData $data): Task
    {
        $project = $this->projects->find($data->projectId);

        foreach ($data->internIds as $internId) {
            $isAssigned = $project->interns->contains('id', $internId);
            if (! $isAssigned) {
                throw new InternNotAssignedToMentorException(
                    'Ce stagiaire n\'est pas assigné à ce projet.'
                );
            }
        }

        $task = $this->tasks->create([
            'id' => (string) Str::uuid(),
            'project_id' => $data->projectId,
            'created_by' => $data->createdBy,
            'title' => $data->title,
            'description' => $data->description,
            'due_date' => $data->dueDate,
        ]);

        $attachData = [];
        foreach ($data->internIds as $internId) {
            $attachData[$internId] = ['status' => TaskStatus::Todo->value];
        }
        $task->interns()->attach($attachData);

        $task->loadMissing('interns');
        foreach ($task->interns as $intern) {
            $intern->notify(new TaskAssignedNotification($task));
        }

        return $task;
    }
}