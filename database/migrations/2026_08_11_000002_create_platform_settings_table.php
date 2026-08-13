<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('platform_name')->default('STAMUX');
            $table->string('institution_name')->nullable();
            $table->string('default_language', 10)->default('fr');
            $table->string('timezone', 64)->default('Africa/Porto-Novo');
            $table->string('contact_email')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
    }
};