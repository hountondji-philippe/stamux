<?php

namespace App\Models;

use App\Enums\InternshipDateChangeStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternshipDateChangeRequest extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'internship_id',
        'intern_id',
        'requested_start_date',
        'requested_end_date',
        'reason',
        'status',
        'admin_comment',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'requested_start_date' => 'date',
            'requested_end_date' => 'date',
            'status' => InternshipDateChangeStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }

    public function intern(): BelongsTo
    {
        return $this->belongsTo(User::class, 'intern_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
