<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            if (!Schema::hasColumn('reports', 'hidden_by_mentor_at')) {
                $table->timestamp('hidden_by_mentor_at')->nullable()->after('hidden_by_intern_at');
            }
        });
    }
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn('hidden_by_mentor_at');
        });
    }
};