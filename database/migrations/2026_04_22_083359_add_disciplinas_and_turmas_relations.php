<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. CRIAR A TABELA DISCIPLINAS PRIMEIRO
        Schema::create('Disciplinas', function (Blueprint $table) {
            $table->id(); 
            $table->string('nome', 100);
            $table->string('codigo', 20)->unique()->nullable()->comment('Ex: MAT10, PT12');
            $table->text('descricao')->nullable();
            $table->timestamp('data_criacao')->useCurrent();
        });

        Schema::create('Turma_Disciplinas', function (Blueprint $table) {
            $table->unsignedBigInteger('id_turma');
            $table->unsignedBigInteger('id_disciplina');
            $table->unsignedBigInteger('id_professor');

            
            $table->foreign('id_turma')->references('id')->on('Turmas')->onDelete('cascade');
            $table->foreign('id_disciplina')->references('id')->on('Disciplinas')->onDelete('cascade');
            $table->foreign('id_professor')->references('id')->on('users')->onDelete('cascade');

            $table->primary(['id_turma', 'id_disciplina']);
        });
    }

    public function down(): void
    {
        
        Schema::dropIfExists('Turma_Disciplinas');
        Schema::dropIfExists('Disciplinas');
    }
};