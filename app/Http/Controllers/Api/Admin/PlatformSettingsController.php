<?php
namespace App\Http\Controllers\Api\Admin;

use App\Models\PlatformSetting;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PlatformSettingsController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => PlatformSetting::current(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $validated = $request->validate([
            'platform_name' => ['sometimes', 'string', 'max:255'],
            'institution_name' => ['nullable', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:500'],
            'default_language' => ['sometimes', 'string', 'max:10'],
            'timezone' => ['sometimes', 'string', 'max:64'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'primary_color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'secondary_color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'success_color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'error_color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'background_primary_color' => ['sometimes', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'background_secondary_color' => ['sometimes', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'font_family' => ['sometimes', 'string', 'max:100'],
            'font_scale' => ['sometimes', 'numeric', 'min:0.85', 'max:1.25'],
        ]);

        $settings = PlatformSetting::current();
        $settings->update($validated);

        return response()->json([
            'success' => true,
            'data' => $settings->fresh(),
        ]);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $request->validate([
            'logo' => ['required', 'image', 'mimes:png,jpg,jpeg,svg', 'max:1024'],
        ]);

        $settings = PlatformSetting::current();

        if ($settings->logo_path && Storage::disk('public')->exists($settings->logo_path)) {
            Storage::disk('public')->delete($settings->logo_path);
        }

        $filename = Str::uuid().'.'.$request->file('logo')->getClientOriginalExtension();
        $path = $request->file('logo')->storeAs('branding', $filename, 'public');

        $settings->update(['logo_path' => $path]);

        return response()->json([
            'success' => true,
            'data' => $settings->fresh(),
        ]);
    }

    public function uploadFavicon(Request $request): JsonResponse
    {
        Gate::authorize('manage', \App\Models\User::class);

        $request->validate([
            'favicon' => ['required', 'image', 'mimes:png,jpg,jpeg,ico', 'max:512'],
        ]);

        $settings = PlatformSetting::current();

        if ($settings->favicon_path && Storage::disk('public')->exists($settings->favicon_path)) {
            Storage::disk('public')->delete($settings->favicon_path);
        }

        $filename = Str::uuid().'.'.$request->file('favicon')->getClientOriginalExtension();
        $path = $request->file('favicon')->storeAs('branding', $filename, 'public');

        $settings->update(['favicon_path' => $path]);

        return response()->json([
            'success' => true,
            'data' => $settings->fresh(),
        ]);
    }
}