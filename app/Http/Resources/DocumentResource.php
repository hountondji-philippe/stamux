<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'intern' => new UserResource($this->whenLoaded('intern')),
            'type' => $this->type->value,
            'status' => $this->status->value,
            'request_note' => $this->request_note,
            'rejection_reason' => $this->rejection_reason,
            'document_number' => $this->document_number,
            'requested_at' => $this->requested_at?->toIso8601String(),
            'reviewed_by' => new UserResource($this->whenLoaded('reviewedBy')),
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'generated_at' => $this->generated_at?->toIso8601String(),
            'is_downloadable' => $this->status->value === 'completed',
        ];
    }
}