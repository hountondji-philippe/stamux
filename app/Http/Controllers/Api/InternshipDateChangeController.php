<?php

namespace App\Http\Controllers\Api;

use App\Actions\InternshipDateChange\RequestInternshipDateChangeAction;
use App\Actions\InternshipDateChange\ReviewInternshipDateChangeAction;
use App\DTOs\InternshipDateChangeData;
use App\Enums\InternshipDateChangeStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\InternshipDateChange\RequestInternshipDateChangeRequest;
use App\Http\Requests\InternshipDateChange\ReviewInternshipDateChangeRequest;
use App\Http\Resources\InternshipDateChangeRequestResource;
use App\Models\InternshipDateChangeRequest as DateChangeRequestModel;
use App\Repositories\Contracts\InternshipRepositoryInterface;
use Illuminate\Http\JsonResponse;

class InternshipDateChangeController extends Controller
{
    public function __construct(
        private RequestInternshipDateChangeAction $requestAction,
        private ReviewInternshipDateChangeAction $reviewAction,
        private InternshipRepositoryInterface $internships,
    ) {
    }

    public function store(RequestInternshipDateChangeRequest $request): JsonResponse
    {
        $user = auth()->user();
        $internship = $this->internships->findActiveByIntern($user->id);

        if (! $internship) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'NO_ACTIVE_INTERNSHIP', 'message' => 'Aucun stage actif trouve.'],
            ], 422);
        }

        $data = InternshipDateChangeData::fromArray(array_merge($request->validated(), [
            'intern_id' => $user->id,
            'internship_id' => $internship->id,
        ]));

        try {
            $changeRequest = $this->requestAction->execute($data);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'REQUEST_ALREADY_PENDING', 'message' => $e->getMessage()],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'data' => new InternshipDateChangeRequestResource($changeRequest),
        ], 201);
    }

    public function history(): JsonResponse
    {
        $requests = DateChangeRequestModel::where('intern_id', auth()->id())
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => InternshipDateChangeRequestResource::collection($requests),
        ]);
    }

    public function pending(): JsonResponse
    {
        if (! auth()->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'UNAUTHORIZED', 'message' => 'Action non autorisee.'],
            ], 403);
        }

        $requests = DateChangeRequestModel::where('status', InternshipDateChangeStatus::Pending->value)
            ->with('intern')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => InternshipDateChangeRequestResource::collection($requests),
        ]);
    }

    public function review(string $id, ReviewInternshipDateChangeRequest $request): JsonResponse
    {
        $changeRequest = DateChangeRequestModel::find($id);

        if (! $changeRequest) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'REQUEST_NOT_FOUND', 'message' => 'Demande introuvable.'],
            ], 404);
        }

        $validated = $request->validated();

        try {
            $updated = $this->reviewAction->execute(
                $changeRequest,
                auth()->user(),
                InternshipDateChangeStatus::from($validated['status']),
                $validated['admin_comment'] ?? null
            );
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'ALREADY_REVIEWED', 'message' => $e->getMessage()],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'data' => new InternshipDateChangeRequestResource($updated),
        ]);
    }
}
