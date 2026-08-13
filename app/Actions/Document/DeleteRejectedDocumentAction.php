<?php
namespace App\Actions\Document;
use App\Enums\DocumentStatus;
use App\Exceptions\UnauthorizedDocumentAccessException;
use App\Models\Document;
use App\Models\User;
class DeleteRejectedDocumentAction
{
    public function execute(Document $document, User $user): void
    {
        $rejectedStatuses = [
            DocumentStatus::MentorRejected->value,
            DocumentStatus::AdminRejected->value,
        ];

        if ($document->intern_id !== $user->id || !in_array($document->status->value, $rejectedStatuses, true)) {
            throw new UnauthorizedDocumentAccessException(
                'Seule une demande rejetée peut être supprimée par son propriétaire.'
            );
        }

        $document->delete();
    }
}