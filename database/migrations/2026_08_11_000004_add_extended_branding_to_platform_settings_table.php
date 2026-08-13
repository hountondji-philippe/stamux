<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->string('tagline')->nullable()->after('institution_name');
            $table->string('favicon_path')->nullable()->after('logo_path');
            $table->string('success_color', 9)->default('#10B981')->after('secondary_color');
            $table->string('error_color', 9)->default('#EF4444')->after('success_color');
        });
    }
    public function down(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->dropColumn(['tagline', 'favicon_path', 'success_color', 'error_color']);
        });
    }
};