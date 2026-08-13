<?php
namespace App\Models;
use App\Enums\PermissionStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Permission extends Model
{
    use HasFactory, HasUuids;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'intern_id',
        'internship_id',
        'start_date',
        'end_date',
        'reason',
        'status',
        'mentor_comment',
        'reviewed_by',
        'reviewed_at',
    ];
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'status' => PermissionStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }
    public function intern(): BelongsTo
    {
        return $this->belongsTo(User::class, 'intern_id');
    }
    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }
    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}