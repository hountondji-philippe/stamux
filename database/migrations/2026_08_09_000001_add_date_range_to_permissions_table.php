<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            if (!Schema::hasColumn('permissions', 'start_date')) {
                $table->date('start_date')->nullable()->after('internship_id');
            }
            if (!Schema::hasColumn('permissions', 'end_date')) {
                $table->date('end_date')->nullable()->after('start_date');
            }
        });

        if (Schema::hasColumn('permissions', 'date')) {
            DB::table('permissions')->whereNull('start_date')->orderBy('id')->chunkById(200, function ($rows) {
                foreach ($rows as $row) {
                    DB::table('permissions')->where('id', $row->id)->update([
                        'start_date' => $row->date,
                        'end_date' => $row->date,
                    ]);
                }
            });

            Schema::table('permissions', function (Blueprint $table) {
                $table->dropColumn('date');
            });
        }
    }

    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->date('date')->nullable();
        });

        DB::table('permissions')->orderBy('id')->chunkById(200, function ($rows) {
            foreach ($rows as $row) {
                DB::table('permissions')->where('id', $row->id)->update([
                    'date' => $row->start_date,
                ]);
            }
        });

        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date']);
        });
    }
};