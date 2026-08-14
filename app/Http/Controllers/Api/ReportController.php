<?php

namespace App\Http\Controllers\Api;

use App\Actions\Report\GetReportHistoryAction;
use App\Actions\Report\HideReportAction;
use App\Actions\Report\SubmitReportAction;
use App\Actions\Report\UpdateReportAction;
use App\Actions\Report\ValidateReportAction;
use App\DTOs\ReportData;
use App\DTOs\ValidateReportData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Report\SubmitReportRequest;
use App\Http\Requests\Report\UpdateReportRequest;
use App\Http\Requests\Report\ValidateReportRequest;
use App\Http\Resources\ReportResource;
use App\Repositories\Contracts\InternshipRepositoryInterface;
use App\Repositories\Contracts\ReportRepositoryInterface;
use App\Services\FileStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ReportController extends Controller
{
    public function __construct(
        private SubmitReportAction $submitReportAction,
        private ValidateReportAction $validateReportAction,
        private GetReportHistoryAction $getReportHistoryAction,
        private UpdateReportAction $updateReportAction,
        private HideReportAction $hideReportAction,
        private ReportRepositoryInterface $reports,
        private InternshipRepositoryInterface$internships,
        private FileStorageService $fileStorage,
    ) {
    }

    public function store(SubmitReportRequest$request): JsonResponse
    {
        $user = auth()->user();
        $internship = $this->internships->findActiveByIntern($user->id);

        if (! $internship) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'NO_ACTIVE_INTERNSHIP',
                    'message' => 'Aucun stageactif trouvé.',
                ],
            ], 422);
        }

        $data = ReportData::fromArray(array_merge($request->validated(), [
            'intern_id' => $user->id,
            'internship_id' => $internship->id,
            'file' => $request->file('file'),
        ]));

        $report = $this->submitReportAction->execute($data);

        return response()->json([
            'success' => true,
            'data' => new ReportResource($report),
        ], 201);
    }

    public function index(): JsonResponse
    {
        $user = auth()->user();

        if ($user->isAdmin()) {
            $reports = $this->reports->paginate(15);
        } elseif ($user->isMentor()) {
            $reports = $this->reports->paginateForMentor($user->id, 15);
        } else {
            $reports = $this->getReportHistoryAction->execute($user->id, 15);
        }

        return response()->json([
            'success' => true,
            'data' => ReportResource::collection($reports),
            'meta' => [
                'total' => $reports->total(),
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
            ],
        ]);
    }

    public function pending(): JsonResponse
    {
        if (! auth()->user()->isAdmin() && ! auth()->user()->isMentor()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $reports = auth()->user()->isAdmin()
            ? $this->reports->pending()
            : $this->reports->pendingForMentor(auth()->id());

        return response()->json([
            'success' => true,
            'data' => ReportResource::collection($reports),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $report = $this->reports->find($id);

        if (! $report) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'REPORT_NOT_FOUND', 'message' => 'Rapport introuvable.'],
            ], 404);
        }

        Gate::authorize('view', $report);

        return response()->json([
            'success' => true,
            'data' => new ReportResource($report),
        ]);
    }

    public function update(UpdateReportRequest $request, string $id): JsonResponse
    {
        $report = $this->reports->find($id);

        if (! $report) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'REPORT_NOT_FOUND', 'message' => 'Rapport introuvable.'],
            ], 404);
        }

        Gate::authorize('update', $report);

        $data = $request->validated();

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $data['file_path'] = $this->fileStorage->store($file, "reports/{$report->intern_id}");
            $data['file_name'] = $file->getClientOriginalName();
            $data['file_size'] = $file->getSize();
        }

        $updated = $this->updateReportAction->execute($report, $data);

        return response()->json([
            'success' => true,
            'data' => new ReportResource($updated),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $report = $this->reports->find($id);

        if (! $report) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'REPORT_NOT_FOUND', 'message' => 'Rapport introuvable.'],
            ], 404);
        }

        Gate::authorize('delete', $report);

        $this->hideReportAction->execute($report, auth()->user());

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Rapport masqué de votre historique.'],
        ]);
    }

    public function validateReport(ValidateReportRequest $request, string $id): JsonResponse
    {
        $report = $this->reports->find($id);

        if (! $report) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'REPORT_NOT_FOUND', 'message' => 'Rapport introuvable.'],
            ], 404);
        }

        Gate::authorize('validate', $report);

        $data = ValidateReportData::fromArray(array_merge($request->validated(), [
            'validated_by' => auth()->id(),
        ]));

        $updated = $this->validateReportAction->execute($report, $data);

        return response()->json([
            'success' => true,
            'data' => new ReportResource($updated),
        ]);
    }

    public function download(string $id): JsonResponse
    {
        $report = $this->reports->find($id);

        if (! $report) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'REPORT_NOT_FOUND', 'message' => 'Rapport introuvable.'],
            ], 404);
        }

        Gate::authorize('download', $report);

        $url = $this->fileStorage->temporaryUrl($report->file_path, 15);

        return response()->json([
            'success' => true,
            'data' => ['url' => $url],
        ]);
    }
}