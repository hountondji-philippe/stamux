<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->string('logo_path')->nullable()->after('platform_name');
            $table->string('primary_color', 9)->default('#2563EB')->after('contact_email');
            $table->string('secondary_color', 9)->default('#4F46E5')->after('primary_color');
        });
    }
    public function down(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->dropColumn(['logo_path', 'primary_color', 'secondary_color']);
        });
    }
};