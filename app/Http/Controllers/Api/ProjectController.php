<?php

namespace App\Http\Controllers\Api;

use App\Actions\Project\AssignProjectToInternsAction;
use App\Actions\Project\CreateProjectAction;
use App\Actions\Project\EvaluateInternAction;
use App\Actions\Project\UpdateProjectProgressAction;
use App\DTOs\EvaluateInternData;
use App\DTOs\ProjectData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Project\AssignProjectRequest;
use App\Http\Requests\Project\CreateProjectRequest;
use App\Http\Requests\Project\EvaluateInternRequest;
use App\Http\Resources\ProjectResource;
use App\Repositories\Contracts\ProjectRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate; // ← AJOUT

class ProjectController extends Controller
{
    public function __construct(
        private CreateProjectAction $createProjectAction,
        private AssignProjectToInternsAction $assignProjectAction,
        private UpdateProjectProgressAction $updateProgressAction,
        private EvaluateInternAction $evaluateInternAction,
        private ProjectRepositoryInterface $projects,
    ) {
    }

    public function store(CreateProjectRequest $request): JsonResponse
    {
        $data = ProjectData::fromArray(array_merge($request->validated(), [
            'mentor_id' => auth()->id(),
        ]));

        $project = $this->createProjectAction->execute($data);

        return response()->json([
            'success' => true,
            'data' => new ProjectResource($project),
        ], 201);
    }

    public function index(): JsonResponse
    {
        $user = auth()->user();

        $projects = $user->isAdmin()
            ? $this->projects->all()
            : ($user->isMentor()
                ? $this->projects->byMentor($user->id)
                : $this->projects->forIntern($user->id));

        return response()->json([
            'success' => true,
            'data' => ProjectResource::collection($projects),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $project = $this->projects->find($id);

        Gate::authorize('view', $project); // ← REMPLACÉ

        return response()->json([
            'success' => true,
            'data' => new ProjectResource($project),
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $project = $this->projects->find($id);

        Gate::authorize('update', $project); // ← REMPLACÉ

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'objectives' => ['nullable', 'string', 'max:2000'],
            'deliverables' => ['nullable', 'string', 'max:2000'],
            'end_date' => ['nullable', 'date'],
        ]);

        $updated = $this->projects->update($project, $validated);

        return response()->json([
            'success' => true,
            'data' => new ProjectResource($updated),
        ]);
    }

    public function assign(AssignProjectRequest $request, string $id): JsonResponse
    {
        $project = $this->projects->find($id);

        Gate::authorize('assign', $project); // ← REMPLACÉ

        $updated = $this->assignProjectAction->execute(
            $project,
            $request->validated('intern_ids')
        );

        return response()->json([
            'success' => true,
            'data' => new ProjectResource($updated),
        ]);
    }

    public function unassign(string $id, string $internId): JsonResponse
    {
        $project = $this->projects->find($id);

        Gate::authorize('assign', $project); // ← REMPLACÉ

        $project->interns()->detach($internId);

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Stagiaire retiré du projet.'],
        ]);
    }

    public function updateProgress(Request $request, string $id): JsonResponse
    {
        $project = $this->projects->find($id);

        Gate::authorize('update', $project); // ← REMPLACÉ

        $validated = $request->validate([
            'progress' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $updated = $this->updateProgressAction->execute($project, $validated['progress']);

        return response()->json([
            'success' => true,
            'data' => new ProjectResource($updated),
        ]);
    }

    public function evaluate(EvaluateInternRequest $request, string $id, string $internId): JsonResponse
    {
        $project = $this->projects->find($id);

        Gate::authorize('evaluate', $project); // ← REMPLACÉ

        $data = EvaluateInternData::fromArray(array_merge($request->validated(), [
            'intern_id' => $internId,
        ]));

        $pivot = $this->evaluateInternAction->execute($project, $data);

        return response()->json([
            'success' => true,
            'data' => [
                'evaluation_score' => $pivot->evaluation_score,
                'evaluation_comment' => $pivot->evaluation_comment,
                'evaluated_at' => $pivot->evaluated_at?->toIso8601String(),
            ],
        ]);
    }
}