<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('Seguidores_Usuarios')) {
            return;
        }

        Schema::create('Seguidores_Usuarios', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_seguidor');
            $table->unsignedBigInteger('id_seguido');
            $table->timestamps();

            $table->unique(['id_seguidor', 'id_seguido'], 'uniq_seguidor_seguido');
            $table->foreign('id_seguidor')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_seguido')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Seguidores_Usuarios');
    }
};
