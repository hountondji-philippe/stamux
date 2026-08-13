<?php
namespace App\DTOs;
use Carbon\Carbon;
final readonly class PermissionData
{
    public function __construct(
        public string $internId,
        public string $internshipId,
        public Carbon $startDate,
        public Carbon $endDate,
        public string $reason,
    ) {
    }
    public static function fromArray(array $data): self
    {
        return new self(
            internId: $data['intern_id'],
            internshipId: $data['internship_id'],
            startDate: Carbon::parse($data['start_date']),
            endDate: Carbon::parse($data['end_date']),
            reason: $data['reason'],
        );
    }
}