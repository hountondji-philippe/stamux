<?php

namespace App\Repositories\Contracts;

use App\Models\Project;
use Illuminate\Support\Collection;

interface ProjectRepositoryInterface
{
    public function find(string $id): ?Project;

    public function create(array $data): Project;

    public function update(Project $project, array $data): Project;

    public function byMentor(string $mentorId): Collection;
    public function all(): Collection;

    public function forIntern(string $internId): Collection;
}