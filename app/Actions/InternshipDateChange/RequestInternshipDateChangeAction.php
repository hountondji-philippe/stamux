<?php

namespace App\Actions\InternshipDateChange;

use App\DTOs\InternshipDateChangeData;
use App\Enums\InternshipDateChangeStatus;
use App\Models\InternshipDateChangeRequest;
use Illuminate\Support\Str;

class RequestInternshipDateChangeAction
{
    public function execute(InternshipDateChangeData $data): InternshipDateChangeRequest
    {
        $existingPending = InternshipDateChangeRequest::where('internship_id', $data->internshipId)
            ->where('status', InternshipDateChangeStatus::Pending->value)
            ->exists();

        if ($existingPending) {
            throw new \RuntimeException('Une demande de modification de dates est deja en attente pour ce stage.');
        }

        return InternshipDateChangeRequest::create([
            'id' => (string) Str::uuid(),
            'internship_id' => $data->internshipId,
            'intern_id' => $data->internId,
            'requested_start_date' => $data->requestedStartDate,
            'requested_end_date' => $data->requestedEndDate,
            'reason' => $data->reason,
            'status' => InternshipDateChangeStatus::Pending->value,
        ]);
    }
}
