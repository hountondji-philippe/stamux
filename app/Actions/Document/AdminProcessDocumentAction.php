<?php

namespace App\Actions\Document;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Notifications\DocumentReadyNotification;
use App\Notifications\DocumentRejectedNotification;
use App\Repositories\Contracts\DocumentRepositoryInterface;
use App\Services\FileStorageService;
use Illuminate\Http\UploadedFile;

class AdminProcessDocumentAction
{
    public function __construct(
        private DocumentRepositoryInterface $documents,
        private FileStorageService $fileStorage,
    ) {
    }

    public function upload(Document $document, string $adminId, UploadedFile $file): Document
    {
        $folder = $document->type->value === 'attestation'
            ? 'documents/attestations'
            : 'documents/conventions';

        $path = $this->fileStorage->store($file, $folder);
        $documentNumber = $this->documents->nextDocumentNumber(now()->year);

        $updated = $this->documents->update($document, [
            'status' => DocumentStatus::Completed->value,
            'file_path' => $path,
            'document_number' => $documentNumber,
            'reviewed_by' => $adminId,
            'reviewed_at' => now(),
            'uploaded_at' => now(),
        ]);

        $updated->intern->notify(new DocumentReadyNotification($updated));

        return $updated;
    }

    public function reject(Document $document, string $adminId, string $reason): Document
    {
        $updated = $this->documents->update($document, [
            'status' => DocumentStatus::AdminRejected->value,
            'reviewed_by' => $adminId,
            'reviewed_at' => now(),
            'rejection_reason' => $reason,
        ]);

        $updated->loadMissing('intern');
        $updated->intern->notify(new DocumentRejectedNotification($updated, 'admin'));

        return $updated;
    }
}