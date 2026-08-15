<?php

namespace App\DTOs;

final readonly class InternshipDateChangeData
{
    public function __construct(
        public string $internId,
        public string $internshipId,
        public string $requestedStartDate,
        public string $requestedEndDate,
        public string $reason,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            internId: $data['intern_id'],
            internshipId: $data['internship_id'],
            requestedStartDate: $data['requested_start_date'],
            requestedEndDate: $data['requested_end_date'],
            reason: $data['reason'],
        );
    }
}
