<?php
namespace App\Repositories;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
class UserRepository implements UserRepositoryInterface
{
    public function find(string $id): ?User
    {
        return User::find($id);
    }
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }
    public function findByInvitationToken(string $hashedToken): ?User
    {
        return User::where('invitation_token', $hashedToken)
            ->where('invitation_token_expires_at', '>', now())
            ->first();
    }
    public function create(array $data): User
    {
        return User::create($data);
    }
    public function update(User $user, array $data): User
    {
        $user->update($data);
        return $user->fresh();
    }
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = User::query()->with('activeInternshipAsIntern.mentor');
        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('email', 'like', "%{$filters['search']}%");
            });
        }
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
    public function mentorsWithInterns(): Collection
    {
        return User::where('role', 'mentor')
            ->withCount('internsAsMentor')
            ->get();
    }
}