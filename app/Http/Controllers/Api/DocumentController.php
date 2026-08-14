<?php

namespace App\Http\Controllers\Api;

use App\Actions\Document\AdminProcessDocumentAction;
use App\Actions\Document\DeleteRejectedDocumentAction;
use App\Actions\Document\EditRejectedDocumentAction;
use App\Actions\Document\GetSecureDocumentUrlAction;
use App\Actions\Document\MentorValidateDocumentAction;
use App\Actions\Document\RequestDocumentAction;
use App\DTOs\DocumentRequestData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Document\MentorValidateDocumentRequest;
use App\Http\Requests\Document\RejectDocumentRequest;
use App\Http\Requests\Document\RequestDocumentRequest;
use App\Http\Requests\Document\UploadDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Repositories\Contracts\DocumentRepositoryInterface;
use App\Repositories\Contracts\InternshipRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DocumentController extends Controller
{
    public function __construct(
        private RequestDocumentAction $requestDocumentAction,
        private MentorValidateDocumentAction $mentorValidateAction,
        private AdminProcessDocumentAction $adminProcessAction,
        private GetSecureDocumentUrlAction $getSecureUrlAction,
        private DeleteRejectedDocumentAction $deleteRejectedAction,
        private EditRejectedDocumentAction $editRejectedAction,
        private DocumentRepositoryInterface $documents,
        private InternshipRepositoryInterface$internships,
    ) {
    }

    public function store(RequestDocumentRequest $request): JsonResponse
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

        $data = DocumentRequestData::fromArray(array_merge($request->validated(), [
            'intern_id' => $user->id,
            'internship_id' => $internship->id,
        ]));

        $document = $this->requestDocumentAction->execute($data);

        return response()->json([
            'success' => true,
            'data' => new DocumentResource($document),
        ], 201);
    }

    public function index(): JsonResponse
    {
        $user = auth()->user();

        $documents = $user->isIntern()
            ? $this->documents->forIntern($user->id)
            : $this->documents->pending();

        return response()->json([
            'success' => true,
            'data' => DocumentResource::collection($documents),
        ]);
    }

    public function pending(): JsonResponse
    {
        if (! auth()->user()->isMentor()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $documents = $this->documents->pendingForMentor(auth()->id());

        return response()->json([
            'success' => true,
            'data' => DocumentResource::collection($documents),
        ]);
    }

    public function adminPending(): JsonResponse
    {
        Gate::authorize('processAsAdmin', \App\Models\Document::class);

        $documents = $this->documents->pendingForAdmin();

        return response()->json([
            'success' => true,
            'data' => DocumentResource::collection($documents),
        ]);
    }

    public function mentorValidate(MentorValidateDocumentRequest $request, string $id): JsonResponse
    {
        $document = $this->documents->find($id);

        if (! $document) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'DOCUMENT_NOT_FOUND', 'message' => 'Document introuvable.'],
            ], 404);
        }

        Gate::authorize('mentorValidate', $document);

        $updated = $request->validated('status') === 'approved'
            ? $this->mentorValidateAction->approve($document, auth()->id())
            : $this->mentorValidateAction->reject($document, auth()->id(), $request->validated('rejection_reason'));

        return response()->json([
            'success' => true,
            'data' => new DocumentResource($updated),
        ]);
    }

    public function upload(UploadDocumentRequest $request, string $id): JsonResponse
    {
        $document = $this->documents->find($id);

        if (! $document) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'DOCUMENT_NOT_FOUND', 'message' => 'Document introuvable.'],
            ], 404);
        }

        Gate::authorize('processAsAdmin', \App\Models\Document::class);

        $updated = $this->adminProcessAction->upload($document, auth()->id(), $request->file('file'));

        return response()->json([
            'success' => true,
            'data' => new DocumentResource($updated),
        ]);
    }

    public function reject(RejectDocumentRequest $request, string $id): JsonResponse
    {
        $document = $this->documents->find($id);

        if (! $document) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'DOCUMENT_NOT_FOUND', 'message' => 'Document introuvable.'],
            ], 404);
        }

        Gate::authorize('processAsAdmin', \App\Models\Document::class);

        $updated = $this->adminProcessAction->reject(
            $document,
            auth()->id(),
            $request->validated('rejection_reason')
        );

        return response()->json([
            'success' => true,
            'data' => new DocumentResource($updated),
        ]);
    }

    public function downloadFile(string $id)
    {
        $document = $this->documents->find($id);

        if (! $document) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'DOCUMENT_NOT_FOUND', 'message' => 'Document introuvable.'],
            ], 404);
        }

        Gate::authorize('download', $document);

        if ($document->status !== \App\Enums\DocumentStatus::Completed || ! $document->file_path) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'DOCUMENT_NOT_READY', 'message' => 'Ce document n\'est pas encore disponible.'],
            ], 422);
        }

        $filename = $document->type->value . '-' . $document->document_number . '.pdf';

        return \Illuminate\Support\Facades\Storage::disk('local')->download($document->file_path, $filename);
    }

    public function download(string $id): JsonResponse
    {
        $document = $this->documents->find($id);

        if (! $document) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'DOCUMENT_NOT_FOUND', 'message' => 'Document introuvable.'],
            ], 404);
        }

        Gate::authorize('download', $document);

        $url = $this->getSecureUrlAction->execute($document);

        return response()->json([
            'success' => true,
            'data' => ['url' => $url],
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $document = $this->documents->find($id);

        if (! $document) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'DOCUMENT_NOT_FOUND', 'message' => 'Document introuvable.'],
            ], 404);
        }

        $this->deleteRejectedAction->execute($document, auth()->user());

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Demande supprimée avec succès.'],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $document = $this->documents->find($id);

        if (! $document) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'DOCUMENT_NOT_FOUND', 'message' => 'Document introuvable.'],
            ], 404);
        }

        $validated = $request->validate([
            'request_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $updated = $this->editRejectedAction->execute(
            $document,
            auth()->user(),
            $validated['request_note'] ?? null
        );

        return response()->json([
            'success' => true,
            'data' => new DocumentResource($updated),
        ]);
    }
}