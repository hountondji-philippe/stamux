<?php

namespace App\Http\Controllers\Api;

use App\Actions\Attendance\GetAttendanceDashboardAction;
use App\Actions\Attendance\RecordAttendanceAction;
use App\DTOs\AttendanceData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\RecordAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use App\Repositories\Contracts\InternshipRepositoryInterface;
use App\Services\FileStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class AttendanceController extends Controller
{
    public function __construct(
        private RecordAttendanceAction $recordAttendanceAction,
        private GetAttendanceDashboardAction $getDashboardAction,
        private AttendanceRepositoryInterface $attendances,
        private InternshipRepositoryInterface $internships,
        private FileStorageService $fileStorage,
    ) {
    }

    public function store(RecordAttendanceRequest $request): JsonResponse
    {
        $user = auth()->user();

        $internship = $this->internships->findActiveByIntern($user->id);

        if (! $internship) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'NO_ACTIVE_INTERNSHIP',
                    'message' => 'Aucun stage actif trouvé pour cet utilisateur.',
                ],
            ], 422);
        }

        $validated = $request->validated();

        $lateProofPath = $request->hasFile('late_proof')
            ? $this->fileStorage->store($request->file('late_proof'), 'attendance-proofs')
            : null;

        $data = AttendanceData::fromArray(array_merge($validated, [
            'intern_id' => $user->id,
            'internship_id' => $internship->id,
            'late_proof_path' => $lateProofPath,
        ]));

        $attendance = $this->recordAttendanceAction->execute($data);

        return response()->json([
            'success' => true,
            'data' => new AttendanceResource($attendance),
        ], 201);
    }

    public function history(): JsonResponse
    {
        $attendances = $this->attendances->historyForIntern(auth()->id());

        return response()->json([
            'success' => true,
            'data' => AttendanceResource::collection($attendances),
        ]);
    }

    public function recordDeparture(string $id): JsonResponse
    {
        $attendance = $this->attendances->find($id);

        if (! $attendance) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'ATTENDANCE_NOT_FOUND',
                    'message' => 'Enregistrement de présence introuvable.',
                ],
            ], 404);
        }

        if ($attendance->intern_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'UNAUTHORIZED',
                    'message' => 'Vous ne pouvez pas modifier cette présence.',
                ],
            ], 403);
        }

        if ($attendance->departure_time !== null) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'DEPARTURE_ALREADY_RECORDED',
                    'message' => 'L’heure de départ a déjà été enregistrée.',
                ],
            ], 409);
        }

        $updated = $this->attendances->update($attendance, [
            'departure_time' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => new AttendanceResource($updated),
        ]);
    }

    public function dashboard(): JsonResponse
    {
        Gate::authorize('viewDashboard', \App\Models\Attendance::class);

        $result = $this->getDashboardAction->execute(auth()->user());

        return response()->json([
            'success' => true,
            'data' => [
                'attendances' => AttendanceResource::collection($result['attendances']),
                'stats' => $result['stats'],
            ],
        ]);
    }

    public function byIntern(string $internId): JsonResponse
    {
        Gate::authorize('viewByIntern', [\App\Models\Attendance::class, $internId]);

        $attendances = $this->attendances->historyForIntern($internId);

        return response()->json([
            'success' => true,
            'data' => AttendanceResource::collection($attendances),
        ]);
    }

    public function correct(string $id, \Illuminate\Http\Request $request): JsonResponse
    {
        $attendance = $this->attendances->find($id);

        Gate::authorize('correct', $attendance);

        $validated = $request->validate([
            'status' => ['required', \Illuminate\Validation\Rule::enum(\App\Enums\AttendanceStatus::class)],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $updated = $this->attendances->update($attendance, $validated);

        return response()->json([
            'success' => true,
            'data' => new AttendanceResource($updated),
        ]);
    }
}