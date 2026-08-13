<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->string('font_family')->default('Inter')->after('background_secondary_color');
            $table->decimal('font_scale', 3, 2)->default(1.00)->after('font_family');
        });
    }
    public function down(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->dropColumn(['font_family', 'font_scale']);
        });
    }
};