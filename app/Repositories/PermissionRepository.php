<?php
namespace App\Repositories;
use App\Enums\PermissionStatus;
use App\Models\Permission;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Collection;
class PermissionRepository implements PermissionRepositoryInterface
{
    public function find(string $id): ?Permission
    {
        return Permission::find($id);
    }
    public function create(array $data): Permission
    {
        return Permission::create($data);
    }
    public function update(Permission $permission, array $data): Permission
    {
        $permission->update($data);
        return $permission->fresh();
    }
    public function historyForIntern(string $internId): Collection
    {
        return Permission::where('intern_id', $internId)
            ->orderBy('start_date', 'desc')
            ->get();
    }
    public function pendingForMentor(string $mentorId): Collection
    {
        return Permission::whereHas('internship', function ($query) use ($mentorId) {
            $query->where('mentor_id', $mentorId);
        })
            ->where('status', PermissionStatus::Pending->value)
            ->with('intern')
            ->orderBy('start_date', 'desc')
            ->get();
    }
    public function hasOverlappingRequest(string $internId, Carbon $startDate, Carbon $endDate): bool
    {
        return Permission::where('intern_id', $internId)
            ->where('status', '!=', PermissionStatus::Rejected->value)
            ->where('start_date', '<=', $endDate->toDateString())
            ->where('end_date', '>=', $startDate->toDateString())
            ->exists();
    }
}