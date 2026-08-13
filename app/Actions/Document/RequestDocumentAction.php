<?php
namespace App\Actions\Document;
use App\DTOs\DocumentRequestData;
use App\Enums\DocumentStatus;
use App\Exceptions\DocumentAlreadyRequestedException;
use App\Models\Document;
use App\Notifications\DocumentRequestedNotification;
use App\Repositories\Contracts\DocumentRepositoryInterface;
use Illuminate\Support\Str;
class RequestDocumentAction
{
    public function __construct(
        private DocumentRepositoryInterface $documents,
    ) {
    }
    public function execute(DocumentRequestData $data): Document
    {
        $blockingStatuses = [
            DocumentStatus::Pending->value,
            DocumentStatus::MentorApproved->value,
            DocumentStatus::Completed->value,
        ];

        $existing = $this->documents->forIntern($data->internId)
            ->filter(fn (Document $doc) => $doc->type->value === $data->type->value
                && in_array($doc->status->value, $blockingStatuses, true));

        if ($existing->isNotEmpty()) {
            throw new DocumentAlreadyRequestedException(
                'Une demande pour ce type de document existe déjà et n\'a pas été rejetée.'
            );
        }

        $document = $this->documents->create([
            'id' => (string) Str::uuid(),
            'intern_id' => $data->internId,
            'internship_id' => $data->internshipId,
            'type' => $data->type->value,
            'status' => DocumentStatus::Pending->value,
            'request_note' => $data->requestNote,
            'requested_at' => now(),
        ]);

        $document->loadMissing('internship.mentor');
        if ($document->internship->mentor) {
            $document->internship->mentor->notify(new DocumentRequestedNotification($document));
        }

        return $document;
    }
}