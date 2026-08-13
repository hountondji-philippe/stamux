<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->string('background_primary_color', 7)->default('#FFFFFF')->after('error_color');
            $table->string('background_secondary_color', 7)->default('#F8FAFC')->after('background_primary_color');
        });
    }

    public function down(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->dropColumn(['background_primary_color', 'background_secondary_color']);
        });
    }
};