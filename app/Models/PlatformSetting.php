<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PlatformSetting extends Model
{
    protected $fillable = [
        'platform_name',
        'logo_path',
        'favicon_path',
        'institution_name',
        'tagline',
        'default_language',
        'timezone',
        'contact_email',
        'primary_color',
        'secondary_color',
        'success_color',
        'error_color',
        'background_primary_color',
        'background_secondary_color',
        'font_family',
        'font_scale',
    ];

    protected $appends = ['logo_url', 'favicon_url'];

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null;
    }

    public function getFaviconUrlAttribute(): ?string
    {
        return $this->favicon_path ? Storage::disk('public')->url($this->favicon_path) : null;
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate(['id' => 1]);
    }
}