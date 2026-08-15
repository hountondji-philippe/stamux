<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternshipFeedback extends Model
{
    protected $table = 'internship_feedbacks';

    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'intern_id',
        'internship_id',
        'welcome_rating',
        'mentorship_rating',
        'atmosphere_rating',
        'professional_value_rating',
        'recommendation_score',
        'comment',
        'is_anonymous',
    ];

    protected $hidden = [
        'intern_id',
    ];

    protected function casts(): array
    {
        return [
            'welcome_rating' => 'integer',
            'mentorship_rating' => 'integer',
            'atmosphere_rating' => 'integer',
            'professional_value_rating' => 'integer',
            'recommendation_score' => 'integer',
            'is_anonymous' => 'boolean',
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
}