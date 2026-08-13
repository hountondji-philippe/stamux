<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('role');
            $table->string('permission_key');
            $table->string('label');
            $table->string('description')->nullable();
            $table->boolean('enabled')->default(true);
            $table->boolean('is_dynamic')->default(false);
            $table->timestamps();

            $table->unique(['role', 'permission_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};