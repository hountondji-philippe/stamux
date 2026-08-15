<?php

namespace App\Actions\InternshipDateChange;

use App\Enums\InternshipDateChangeStatus;
use App\Models\InternshipDateChangeRequest;
use App\Models\User;

class ReviewInternshipDateChangeAction
{
    public function execute(
        InternshipDateChangeRequest $changeRequest,
        User $reviewer,
        InternshipDateChangeStatus $status,
        ?string $comment
    ): InternshipDateChangeRequest {
        if ($changeRequest->status !== InternshipDateChangeStatus::Pending) {
            throw new \RuntimeException('Cette demande a deja ete traitee.');
        }

        $changeRequest->update([
            'status' => $status->value,
            'admin_comment' => $comment,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
        ]);

        if ($status === InternshipDateChangeStatus::Approved) {
            $internship = $changeRequest->internship;
            $newStart = $changeRequest->requested_start_date;
            $newEnd = $changeRequest->requested_end_date;

            $internship->update([
                'start_date' => $newStart,
                'end_date' => $newEnd,
                'duration_days' => $newStart->diffInDays($newEnd) + 1,
            ]);
        }

        return $changeRequest->fresh();
    }
}
