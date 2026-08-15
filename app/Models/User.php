<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable, SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'email',
        'password',
        'role',
        'status',
        'avatar_path',
        'phone',
        'phone',
        'phone',
        'mfa_enabled',
        'mfa_secret',
        'consent_accepted_at',
        'invitation_token',
        'invitation_token_expires_at',
        'invitation_accepted_at',
        'notify_email',
        'notify_push',
        'notify_attendance_reminder',
        'theme',
        'bio',
        'company',
        'department',
        'availability',
        'max_capacity',
        'admin_rating',
        'admin_rating_comment',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'mfa_secret',
        'invitation_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'status' => UserStatus::class,
            'mfa_enabled' => 'boolean',
            'notify_email' => 'boolean',
            'notify_push' => 'boolean',
            'notify_attendance_reminder' => 'boolean',
            'availability' => 'boolean',
            'consent_accepted_at' => 'datetime',
            'invitation_token_expires_at' => 'datetime',
            'invitation_accepted_at' => 'datetime',
        ];
    }

    public function internshipAsIntern(): HasMany
    {
        return $this->hasMany(Internship::class, 'intern_id');
    }

    public function activeInternshipAsIntern(): HasOne
    {
        return $this->hasOne(Internship::class, 'intern_id')
            ->where('status', 'active')
            ->ofMany(['created_at' => 'max']);
    }

    public function internsAsMentor(): HasMany
    {
        return $this->hasMany(Internship::class, 'mentor_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'intern_id');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'intern_id');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'mentor_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'intern_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'author_id');
    }

    public function isIntern(): bool
    {
        return $this->role === UserRole::Intern;
    }

    public function isMentor(): bool
    {
        return $this->role === UserRole::Mentor;
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }
}