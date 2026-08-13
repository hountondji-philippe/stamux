<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'mentor' => new UserResource($this->whenLoaded('mentor')),
            'title' => $this->title,
            'description' => $this->description,
            'objectives' => $this->objectives,
            'deliverables' => $this->deliverables,
            'progress' => $this->progress,
            'start_date' => $this->start_date->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'status' => $this->status->value,
            'tasks_count' => $this->whenCounted('tasks'),
            'interns' => $this->whenLoaded('interns', function () {
                return $this->interns->map(function ($intern) {
                    return [
                        'id' => $intern->id,
                        'name' => $intern->name,
                        'email' => $intern->email,
                        'evaluation_score' => $intern->pivot->evaluation_score ?? null,
                        'evaluation_comment' => $intern->pivot->evaluation_comment ?? null,
                        'assigned_at' => $intern->pivot->assigned_at?->toIso8601String(),
                    ];
                });
            }),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}