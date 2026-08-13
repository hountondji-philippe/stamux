<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('bio')->nullable()->after('phone');
            $table->string('company')->nullable()->after('bio');
            $table->string('department')->nullable()->after('company');
            $table->boolean('availability')->default(true)->after('department');
            $table->unsignedInteger('max_capacity')->nullable()->after('availability');
        });
    }
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['bio', 'company', 'department', 'availability', 'max_capacity']);
        });
    }
};