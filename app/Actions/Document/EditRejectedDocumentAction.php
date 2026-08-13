<?php
namespace App\Actions\Document;
use App\Enums\DocumentStatus;
use App\Exceptions\UnauthorizedDocumentAccessException;
use App\Models\Document;
use App\Models\User;
use App\Notifications\DocumentRequestedNotification;
class EditRejectedDocumentAction
{
    public function execute(Document $document, User $user, ?string $requestNote): Document
    {
        $rejectedStatuses = [
            DocumentStatus::MentorRejected->value,
            DocumentStatus::AdminRejected->value,
        ];

        if ($document->intern_id !== $user->id || !in_array($document->status->value, $rejectedStatuses, true)) {
            throw new UnauthorizedDocumentAccessException(
                'Seule une demande rejetée peut être modifiée par son propriétaire.'
            );
        }

        $document->update([
            'status' => DocumentStatus::Pending->value,
            'request_note' => $requestNote,
            'rejection_reason' => null,
            'requested_at' => now(),
        ]);

        $document->loadMissing('internship.mentor');
        if ($document->internship->mentor) {
            $document->internship->mentor->notify(new DocumentRequestedNotification($document));
        }

        return $document->fresh();
    }
}