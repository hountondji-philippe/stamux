<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internship_date_change_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('internship_id');
            $table->uuid('intern_id');
            $table->date('requested_start_date');
            $table->date('requested_end_date');
            $table->text('reason');
            $table->string('status')->default('pending');
            $table->text('admin_comment')->nullable();
            $table->uuid('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->foreign('internship_id')->references('id')->on('internships')->cascadeOnDelete();
            $table->foreign('intern_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internship_date_change_requests');
    }
};
