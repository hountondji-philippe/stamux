<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'bio' => $this->bio,
            'company' => $this->company,
            'department' => $this->department,
            'availability' => (bool) $this->availability,
            'max_capacity' => $this->max_capacity,
            'admin_rating' => $this->admin_rating,
            'admin_rating_comment' => $this->admin_rating_comment,
            'language' => $this->language,
            'timezone' => $this->timezone,
            'role' => $this->role,
            'status' => $this->status,
            'avatar_path' => $this->avatar_path,
            'avatar_url' => $this->avatar_path
                ? app(\App\Services\FileStorageService::class)->publicUrl($this->avatar_path)
                : null,
            'mfa_enabled' => $this->mfa_enabled,
            'notify_email' => (bool) $this->notify_email,
            'notify_push' => (bool) $this->notify_push,
            'notify_attendance_reminder' => (bool) $this->notify_attendance_reminder,
            'theme' => $this->theme,
            'created_at' => $this->created_at?->toIso8601String(),
            'assigned_mentor' => $this->when(
                $this->relationLoaded('activeInternshipAsIntern'),
                fn () => $this->activeInternshipAsIntern?->mentor
                    ? ['id' => $this->activeInternshipAsIntern->mentor->id, 'name' => $this->activeInternshipAsIntern->mentor->name]
                    : null
            ),
        ];
    }
}