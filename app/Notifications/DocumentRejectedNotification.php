<?php

namespace App\Notifications;

use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DocumentRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Document $document,
        public string $rejectedBy,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $typeLabel = $this->document->type->value === 'attestation' ? 'attestation' : 'convention de stage';

        return [
            'type' => 'document_rejected',
            'document_id' => $this->document->id,
            'rejected_by' => $this->rejectedBy,
            'reason' => $this->document->rejection_reason,
            'message' => 'Votre demande de '.$typeLabel.' a ete rejetee : '.$this->document->rejection_reason,
        ];
    }
}