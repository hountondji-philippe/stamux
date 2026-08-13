<?php

namespace App\Notifications;

use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DocumentMentorApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Document $document,
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
            'type' => 'document_mentor_approved',
            'document_id' => $this->document->id,
            'intern_name' => $this->document->intern->name,
            'message' => 'Document approuve par le mentor pour '.$this->document->intern->name.' ('.$typeLabel.'), a finaliser.',
        ];
    }
}