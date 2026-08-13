<?php
namespace App\Actions\Project;
use App\DTOs\ProjectData;
use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Repositories\Contracts\ProjectRepositoryInterface;
use Illuminate\Support\Str;
class CreateProjectAction
{
    public function __construct(
        private ProjectRepositoryInterface $projects,
    ) {
    }
    public function execute(ProjectData $data): Project
    {
        return $this->projects->create([
            'id' => (string) Str::uuid(),
            'mentor_id' => $data->mentorId,
            'title' => $data->title,
            'description' => $data->description,
            'objectives' => $data->objectives,
            'deliverables' => $data->deliverables,
            'start_date' => $data->startDate,
            'end_date' => $data->endDate,
            'status' => ProjectStatus::Active->value,
            'progress' => 0,
        ]);
    }
}