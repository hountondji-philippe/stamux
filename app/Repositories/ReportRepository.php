<?php
namespace App\Repositories;
use App\Enums\ReportStatus;
use App\Models\Report;
use App\Repositories\Contracts\ReportRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
class ReportRepository implements ReportRepositoryInterface
{
    public function find(string $id): ?Report
    {
        return Report::find($id);
    }
    public function create(array $data): Report
    {
        return Report::create($data);
    }
    public function update(Report $report, array $data): Report
    {
        $report->update($data);
        return $report->fresh();
    }
    public function paginateForIntern(string $internId, int $perPage = 15): LengthAwarePaginator
    {
        return Report::where('intern_id', $internId)
            ->whereNull('hidden_by_intern_at')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
    public function paginateForMentor(string $mentorId, int $perPage = 15): LengthAwarePaginator
    {
        return Report::whereHas('internship', function ($query) use ($mentorId) {
            $query->where('mentor_id', $mentorId);
        })
            ->whereNull('hidden_by_mentor_at')
            ->with('intern')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Report::orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
    public function pending(): Collection
    {
        return Report::where('status', ReportStatus::Pending->value)
            ->with(['intern', 'internship'])
            ->orderBy('created_at', 'asc')
            ->get();
    }
    public function pendingForMentor(string $mentorId): Collection
    {
        return Report::whereHas('internship', function ($query) use ($mentorId) {
            $query->where('mentor_id', $mentorId);
        })
            ->where('status', ReportStatus::Pending->value)
            ->with(['intern', 'internship'])
            ->orderBy('created_at', 'asc')
            ->get();
    }
}