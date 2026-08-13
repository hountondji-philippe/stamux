<?php
namespace App\Repositories\Contracts;
use App\Models\Report;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
interface ReportRepositoryInterface
{
    public function find(string $id): ?Report;
    public function create(array $data): Report;
    public function update(Report $report, array $data): Report;
    public function paginateForIntern(string $internId, int $perPage = 15): LengthAwarePaginator;
    public function paginateForMentor(string $mentorId, int $perPage = 15): LengthAwarePaginator;
    public function pendingForMentor(string $mentorId): Collection;
    public function paginate(int $perPage = 15): LengthAwarePaginator;
    public function pending(): Collection;
}