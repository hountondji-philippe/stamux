<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Requests\Auth\EnableMfaRequest;
use App\Http\Requests\Auth\UpdateMfaSecretRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\FileStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function __construct(
        private UserRepositoryInterface $users,
        private FileStorageService $fileStorage,
    ) {
    }

    public function show(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new UserResource(auth()->user()),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'language' => ['sometimes', 'string', 'max:10'],
            'timezone' => ['sometimes', 'string', 'max:64'],
            'notify_email' => ['sometimes', 'boolean'],
            'notify_push' => ['sometimes', 'boolean'],
            'notify_attendance_reminder' => ['sometimes', 'boolean'],
            'theme' => ['sometimes', 'string', 'in:light,dark,auto'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'company' => ['sometimes', 'nullable', 'string', 'max:255'],
            'department' => ['sometimes', 'nullable', 'string', 'max:255'],
            'availability' => ['sometimes', 'boolean'],
            'max_capacity' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:50'],
        ]);
        $user = $this->users->update(auth()->user(), $validated);
        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $this->users->update(auth()->user(), [
            'password' => $request->validated('password'),
        ]);
        return response()->json([
            'success' => true,
            'data' => ['message' => 'Mot de passe mis a jour avec succes.'],
        ]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);
        $oldPath = auth()->user()->avatar_path;
        $path = $this->fileStorage->storePublic($request->file('avatar'), 'avatars');
        $user = $this->users->update(auth()->user(), ['avatar_path' => $path]);
        if ($oldPath) {
            $this->fileStorage->deletePublic($oldPath);
        }
        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    public function profileOverview(): JsonResponse
    {
        $user = auth()->user();

        if ($user->isMentor()) {
            $stagiairesCount = \App\Models\Internship::where('mentor_id', $user->id)
                ->where('status', 'active')
                ->count();

            $rapportsValides = \Illuminate\Support\Facades\DB::table('reports')
                ->join('internships', 'internships.id', '=', 'reports.internship_id')
                ->where('internships.mentor_id', $user->id)
                ->where('reports.status', 'validated')
                ->count();

            $noteMoyenne = \Illuminate\Support\Facades\DB::table('project_intern')
                ->join('projects', 'projects.id', '=', 'project_intern.project_id')
                ->where('projects.mentor_id', $user->id)
                ->whereNotNull('project_intern.evaluation_score')
                ->avg('project_intern.evaluation_score');

            $stats = [
                'stagiaires' => $stagiairesCount,
                'rapports_valides' => $rapportsValides,
                'note_moyenne' => $noteMoyenne !== null ? round((float) $noteMoyenne / 20, 1) : null,
            ];
        } else {
            $stats = null;
        }

        $activity = \App\Models\AuditLog::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['action', 'target_type', 'created_at'])
            ->map(fn ($log) => [
                'action' => $log->action,
                'target_type' => $log->target_type,
                'created_at' => $log->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_activity' => $activity,
            ],
        ]);
    }
    public function notifications(): JsonResponse
    {
        $user = auth()->user();

        $notifications = $user->notifications()
            ->orderByDesc('created_at')
            ->limit(30)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'type' => $n->data['type'] ?? $n->type,
                'message' => $n->data['message'] ?? '',
                'read_at' => $n->read_at,
                'created_at' => $n->created_at,
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'notifications' => $notifications,
                'unread_count' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    public function markOneNotificationRead(string $id): JsonResponse
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    public function markNotificationsRead(): JsonResponse
    {
        auth()->user()->unreadNotifications()->update(['read_at' => now()]);
        return response()->json([
            'success' => true,
            'data' => ['message' => 'Notifications marquees comme lues.'],
        ]);
    }

    public function deleteOneNotification(string $id): JsonResponse
    {
        auth()->user()->notifications()->where('id', $id)->delete();

        return response()->json(['success' => true]);
    }

    public function deleteAllNotifications(): JsonResponse
    {
        auth()->user()->notifications()->delete();

        return response()->json(['success' => true]);
    }

    public function dataExport(): JsonResponse
    {
        $user = auth()->user()->load([
            'internshipAsIntern',
            'attendances',
            'reports',
            'documents',
        ]);
        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'internships' => $user->internshipAsIntern,
                'attendances' => $user->attendances,
                'reports' => $user->reports,
                'documents' => $user->documents,
            ],
        ]);
    }

    public function enableMfa(EnableMfaRequest $request): JsonResponse
    {
        $user = auth()->user();
        $updated = $this->users->update($user, [
            'mfa_enabled' => $request->validated('mfa_enabled'),
        ]);
        return response()->json([
            'success' => true,
            'data' => new UserResource($updated),
        ]);
    }

    public function updateMfaSecret(UpdateMfaSecretRequest $request): JsonResponse
    {
        $user = auth()->user();
        $updated = $this->users->update($user, [
            'mfa_secret' => $request->validated('mfa_secret'),
        ]);
        return response()->json([
            'success' => true,
            'data' => new UserResource($updated),
        ]);
    }
}