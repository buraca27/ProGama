<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('User_XP', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_usuario')->unique();
            $table->unsignedInteger('xp_total')->default(0); // Total XP accumulated
            $table->unsignedInteger('nivel_atual')->default(1); // Current level (1-15)
            $table->unsignedInteger('xp_proximo_nivel')->default(1); // XP needed for next level
            $table->dateTime('ultima_atualizacao')->nullable();
            $table->timestamps();

            $table->foreign('id_usuario')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('User_XP');
    }
};
