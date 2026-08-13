<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function(Blueprint $table) {
            if (!Schema::hasColumn('attendances', 'latitude')) {
                $table->decimal('latitude', 10, 7)->nullable()->after('arrival_time');
            }
            if (!Schema::hasColumn('attendances', 'longitude')) {
                $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            }
            if (!Schema::hasColumn('attendances', 'late_reason')) {
                $table->string('late_reason')->nullable()->after('longitude');
            }
            if (!Schema::hasColumn('attendances', 'late_proof_path')) {
                $table->string('late_proof_path')->nullable()->after('late_reason');
            }
        });
    }
    public function down(): void
    {
        Schema::table('attendances', function(Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'late_reason', 'late_proof_path']);
        });
    }
};