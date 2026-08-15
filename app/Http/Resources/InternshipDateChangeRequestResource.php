<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InternshipDateChangeRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'internship_id' => $this->internship_id,
            'intern' => [
                'id' => $this->intern->id,
                'name' => $this->intern->name,
                'email' => $this->intern->email,
            ],
            'requested_start_date' => $this->requested_start_date->toDateString(),
            'requested_end_date' => $this->requested_end_date->toDateString(),
            'reason' => $this->reason,
            'status' => $this->status->value,
            'admin_comment' => $this->admin_comment,
            'reviewed_at' => $this->reviewed_at?->toDateTimeString(),
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
