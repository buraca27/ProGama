<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Regras_XP_Desafio', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_desafio');
            $table->decimal('nota_minima', 5, 2); // ex: 50.00
            $table->decimal('nota_maxima', 5, 2); // ex: 100.00
            $table->unsignedInteger('xp_atribuido'); // XP for this grade range
            $table->timestamps();

            // Foreign key será criado após a tabela Desafio unificada
            // Por agora, deixamos a referência comentada
            // $table->foreign('id_desafio')->references('id')->on('Desafio')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Regras_XP_Desafio');
    }
};
