<?php

namespace App\Http\Controllers\Api\Admin;

use App\Actions\Intern\AssignMentorAction;
use App\Actions\Intern\CreateInternAction;
use App\Actions\Intern\TerminateInternshipAction;
use App\DTOs\CreateInternData;
use App\DTOs\CreateUserData;
use App\Actions\Intern\CompleteInternshipAction;
use App\Actions\Intern\DeleteInternDataAction;
use App\DTOs\TerminateInternshipData;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Jobs\SendEmailNotificationJob;
use App\Notifications\InvitationNotification;
use App\Repositories\Contracts\InternshipRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AdminUserController extends Controller
{
    public function __construct(
        private UserRepositoryInterface $users,
        private InternshipRepositoryInterface $internships,
        private CreateInternAction $createInternAction,
        private AssignMentorAction $assignMentorAction,
        private TerminateInternshipAction $terminateInternshipAction,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $users = $this->users->paginate(15, $request->only(['role', 'status', 'search']));

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users),
            'meta' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['required', \Illuminate\Validation\Rule::enum(UserRole::class)],
            'start_date' => ['required_if:role,intern', 'date'],
            'end_date' => ['required_if:role,intern', 'date', 'after:start_date'],
            'mentor_id' => ['nullable', 'uuid', 'exists:users,id'],
        ]);

        $role = UserRole::from($validated['role']);

        if ($role === UserRole::Intern) {
            $result = $this->createInternAction->execute(
                CreateInternData::fromArray($validated)
            );

            $user = $result['user'];
            $rawToken = $result['raw_invitation_token'];
        } else {
            $user = $this->users->create([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => $role->value,
                'status' => UserStatus::Pending->value,
                'invitation_token' => hash('sha256', $rawToken = \Illuminate\Support\Str::random(64)),
                'invitation_token_expires_at' => now()->addHours(72),
            ]);
        }

        $user->notify(new InvitationNotification($rawToken));

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $user = $this->users->find($id);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $user = $this->users->find($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', \Illuminate\Validation\Rule::enum(UserStatus::class)],
        ]);

        $updated = $this->users->update($user, $validated);

        return response()->json([
            'success' => true,
            'data' => new UserResource($updated),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $user = $this->users->find($id);

        $this->users->update($user, ['status' => UserStatus::Inactive->value]);
        $user->delete();

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Compte désactivé avec succès.'],
        ]);
    }

    public function assignMentor(Request $request, string $id): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $validated = $request->validate([
            'mentor_id' => ['required', 'uuid', 'exists:users,id'],
        ]);

        $internship = $this->internships->findActiveByIntern($id);

        $updated = $this->assignMentorAction->execute($internship, $validated['mentor_id']);

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Mentor affecté avec succès.'],
        ]);
    }

    public function terminate(Request $request, string $id): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $internship = $this->internships->findActiveByIntern($id);

        $this->terminateInternshipAction->execute(
            $internship,
            TerminateInternshipData::fromArray([
                'internship_id' => $internship->id,
                'reason' => $validated['reason'],
            ])
        );

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Stage clôturé avec succès.'],
        ]);
    }

    public function completeInternship(string $id): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $internship = $this->internships->findActiveByIntern($id);

        if (! $internship) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'NO_ACTIVE_INTERNSHIP', 'message' => 'Aucun stage actif trouve.'],
            ], 422);
        }

        app(\App\Actions\Intern\CompleteInternshipAction::class)->execute($internship);

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Stage marque comme termine avec succes.'],
        ]);
    }

    public function deleteInternData(string $id): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $user = $this->users->find($id);

        if (! $user) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'USER_NOT_FOUND', 'message' => 'Utilisateur introuvable.'],
            ], 404);
        }

        app(\App\Actions\Intern\DeleteInternDataAction::class)->execute($user);

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Compte supprime. L\'historique d\'evaluation du mentor a ete conserve.'],
        ]);
    }

    public function purge(string $id): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $user = $this->users->find($id);

        $this->users->update($user, [
            'name' => 'Utilisateur supprimé',
            'email' => 'deleted_'.hash('sha256', $user->email).'@nextmux.deleted',
            'avatar_path' => null,
            'status' => UserStatus::Inactive->value,
        ]);

        $user->delete();

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Données anonymisées avec succès.'],
        ]);
    }

    public function rate(Request $request, string $id): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $user = $this->users->find($id);
        if (! $user) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'USER_NOT_FOUND', 'message' => 'Utilisateur introuvable.'],
            ], 404);
        }

        $validated = $request->validate([
            'admin_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'admin_rating_comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $updated = $this->users->update($user, $validated);

        return response()->json([
            'success' => true,
            'data' => new UserResource($updated),
        ]);
    }

    public function overview(string $id): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $user = $this->users->find($id);
        if (! $user) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'USER_NOT_FOUND', 'message' => 'Utilisateur introuvable.'],
            ], 404);
        }

        if ($user->isMentor()) {
            $internships = \App\Models\Internship::with('intern')
                ->where('mentor_id', $user->id)
                ->where('status', \App\Enums\InternshipStatus::Active->value)
                ->get();

            $interns = $internships->map(function ($internship) {
                $internId = $internship->intern_id;

                $attendanceCounts = \Illuminate\Support\Facades\DB::table('attendances')
                    ->where('intern_id', $internId)
                    ->selectRaw('status, count(*) as total')
                    ->groupBy('status')
                    ->pluck('total', 'status');

                $present = ($attendanceCounts['present'] ?? 0) + ($attendanceCounts['late'] ?? 0);
                $absent = $attendanceCounts['absent'] ?? 0;
                $base = $present + $absent;
                $presencePercent = $base > 0 ? (int) round(($present / $base) * 100) : null;

                $averageNote = \Illuminate\Support\Facades\DB::table('project_intern')
                    ->where('intern_id', $internId)
                    ->whereNotNull('evaluation_score')
                    ->avg('evaluation_score');

                return [
                    'internship_id' => $internship->id,
                    'intern' => [
                        'id' => $internship->intern->id,
                        'name' => $internship->intern->name,
                        'email' => $internship->intern->email,
                    ],
                    'presence_percent' => $presencePercent,
                    'average_note' => $averageNote !== null ? round((float) $averageNote, 1) : null,
                ];
            });

            $feedbackAvg = \Illuminate\Support\Facades\DB::table('internship_feedbacks')
                ->join('internships', 'internships.id', '=', 'internship_feedbacks.internship_id')
                ->where('internships.mentor_id', $user->id)
                ->avg('internship_feedbacks.mentorship_rating');

            return response()->json([
                'success' => true,
                'data' => [
                    'role' => 'mentor',
                    'interns' => $interns->values(),
                    'mentorship_rating_avg' => $feedbackAvg !== null ? round((float) $feedbackAvg, 1) : null,
                ],
            ]);
        }

        if ($user->isIntern()) {
            $internship = $this->internships->findActiveByIntern($user->id);

            $attendances = \Illuminate\Support\Facades\DB::table('attendances')
                ->where('intern_id', $user->id)
                ->orderByDesc('date')
                ->get();

            $reports = \Illuminate\Support\Facades\DB::table('reports')
                ->where('intern_id', $user->id)
                ->orderByDesc('period_start')
                ->get();

            $projects = \Illuminate\Support\Facades\DB::table('projects')
                ->join('project_intern', 'projects.id', '=', 'project_intern.project_id')
                ->where('project_intern.intern_id', $user->id)
                ->select('projects.id', 'projects.title', 'projects.description', 'projects.progress', 'projects.status', 'project_intern.evaluation_score')
                ->get();

            $tasks = \Illuminate\Support\Facades\DB::table('tasks')
                ->join('task_intern', 'tasks.id', '=', 'task_intern.task_id')
                ->where('task_intern.intern_id', $user->id)
                ->select('tasks.id', 'tasks.title', 'tasks.project_id', 'tasks.due_date', 'task_intern.status')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'role' => 'intern',
                    'internship' => $internship,
                    'attendances' => $attendances,
                    'reports' => $reports,
                    'projects' => $projects,
                    'tasks' => $tasks,
                ],
            ]);
        }

        return response()->json(['success' => true, 'data' => ['role' => 'admin']]);
    }

    public function resendInvitation(string $id): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $user = $this->users->find($id);

        $rawToken = \Illuminate\Support\Str::random(64);

        $this->users->update($user, [
            'invitation_token' => hash('sha256', $rawToken),
            'invitation_token_expires_at' => now()->addHours(72),
        ]);

        $user->notify(new InvitationNotification($rawToken));

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Invitation renvoyée avec succès.'],
        ]);
    }
}