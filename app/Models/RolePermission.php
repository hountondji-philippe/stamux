<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'role',
        'permission_key',
        'label',
        'description',
        'enabled',
        'is_dynamic',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'is_dynamic' => 'boolean',
        ];
    }
}