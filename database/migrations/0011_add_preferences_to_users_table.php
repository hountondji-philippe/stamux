<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('notify_email')->default(true)->after('mfa_secret');
            $table->boolean('notify_push')->default(true)->after('notify_email');
            $table->boolean('notify_attendance_reminder')->default(true)->after('notify_push');
            $table->string('theme')->default('light')->after('notify_attendance_reminder');
        });
    }
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['notify_email', 'notify_push', 'notify_attendance_reminder', 'theme']);
        });
    }
};