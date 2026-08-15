<?php

namespace App\Actions\Intern;

use App\Enums\InternshipStatus;
use App\Models\Internship;
use App\Repositories\Contracts\InternshipRepositoryInterface;

class CompleteInternshipAction
{
    public function __construct(
        private InternshipRepositoryInterface $internships,
    ) {
    }

    public function execute(Internship $internship): Internship
    {
        return $this->internships->update($internship, [
            'status' => InternshipStatus::Completed->value,
        ]);
    }
}