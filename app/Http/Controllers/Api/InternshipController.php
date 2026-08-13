<?php
namespace App\Http\Controllers\Api;
use App\Actions\Internship\CreateInternshipAction;
use App\DTOs\CreateInternshipData;
use App\Enums\InternshipStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Internship\CreateInternshipRequest;
use App\Http\Requests\Internship\TerminateInternshipRequest;
use App\Http\Resources\InternshipResource;
use App\Models\Internship;
use App\Repositories\Contracts\InternshipRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class InternshipController extends Controller
{
    public function __construct(
        private CreateInternshipAction $createInternshipAction,
        private InternshipRepositoryInterface $internships,
    ) {
    }

    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', \App\Models\Internship::class);
        $user = auth()->user();
        $internships = $user->isAdmin()
            ? $this->internships->all()
            : $this->internships->internsByMentor($user->id);
        return response()->json([
            'success' => true,
            'data' => InternshipResource::collection($internships),
        ]);
    }

    public function mentorOverview(): JsonResponse
    {
        $user = auth()->user();
        abort_unless($user->isMentor(), 403, "Reserve aux mentors.");

        $internships = Internship::with('intern')
            ->where('mentor_id', $user->id)
            ->where('status', InternshipStatus::Active->value)
            ->get();

        $data = $internships->map(function (Internship $internship) {
            $internId = $internship->intern_id;

            $attendanceCounts = DB::table('attendances')
                ->where('intern_id', $internId)
                ->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');

            $present = ($attendanceCounts['present'] ?? 0) + ($attendanceCounts['late'] ?? 0);
            $absent = $attendanceCounts['absent'] ?? 0;
            $presenceBase = $present + $absent;
            $presencePercent = $presenceBase > 0 ? (int) round(($present / $presenceBase) * 100) : null;

            $tasksTotal = DB::table('task_intern')->where('intern_id', $internId)->count();
            $tasksDone = DB::table('task_intern')->where('intern_id', $internId)->where('status', 'done')->count();

            $averageNote = DB::table('project_intern')
                ->where('intern_id', $internId)
                ->whereNotNull('evaluation_score')
                ->avg('evaluation_score');

            $progressAvg = DB::table('project_intern')
                ->join('projects', 'projects.id', '=', 'project_intern.project_id')
                ->where('project_intern.intern_id', $internId)
                ->avg('projects.progress');

            return [
                'internship_id' => $internship->id,
                'intern' => [
                    'id' => $internship->intern->id,
                    'name' => $internship->intern->name,
                    'email' => $internship->intern->email,
                    'avatar_path' => $internship->intern->avatar_path,
                ],
                'presence_percent' => $presencePercent,
                'tasks_done' => $tasksDone,
                'tasks_total' => $tasksTotal,
                'average_note' => $averageNote !== null ? round((float) $averageNote, 1) : null,
                'progress_percent' => $progressAvg !== null ? (int) round((float) $progressAvg) : null,
            ];
        });

        return response()->json(['success' => true, 'data' => $data->values()]);
    }

    public function internProjectsOverview(string $id): JsonResponse
    {
        $internship = $this->internships->find($id);
        if (! $internship) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'INTERNSHIP_NOT_FOUND', 'message' => 'Stage introuvable.'],
            ], 404);
        }
        Gate::authorize('view', $internship);
        $internId = $internship->intern_id;

        $projects = DB::table('projects')
            ->join('project_intern', 'projects.id', '=', 'project_intern.project_id')
            ->where('project_intern.intern_id', $internId)
            ->select('projects.id', 'projects.title', 'projects.description', 'projects.progress', 'projects.status', 'project_intern.evaluation_score')
            ->get();

        $tasks = DB::table('tasks')
            ->join('task_intern', 'tasks.id', '=', 'task_intern.task_id')
            ->where('task_intern.intern_id', $internId)
            ->select('tasks.id', 'tasks.title', 'tasks.project_id', 'tasks.due_date', 'task_intern.status')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'projects' => $projects,
                'tasks' => $tasks,
            ],
        ]);
    }
    public function store(CreateInternshipRequest $request): JsonResponse
    {
        $data = CreateInternshipData::fromArray($request->validated());
        $internship = $this->createInternshipAction->execute($data);
        return response()->json([
            'success' => true,
            'data' => new InternshipResource($internship),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $internship = $this->internships->find($id);
        if (! $internship) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'INTERNSHIP_NOT_FOUND', 'message' => 'Stage introuvable.'],
            ], 404);
        }
        Gate::authorize('view', $internship);
        return response()->json([
            'success' => true,
            'data' => new InternshipResource($internship),
        ]);
    }

    public function terminate(string $id, TerminateInternshipRequest $request): JsonResponse
    {
        $internship = $this->internships->find($id);
        if (! $internship) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'INTERNSHIP_NOT_FOUND', 'message' => 'Stage introuvable.'],
            ], 404);
        }
        Gate::authorize('terminate', $internship);
        $updated = $this->internships->update($internship, [
            'status' => InternshipStatus::Terminated->value,
            'termination_reason' => $request->validated('termination_reason'),
        ]);
        return response()->json([
            'success' => true,
            'data' => new InternshipResource($updated),
        ]);
    }
}