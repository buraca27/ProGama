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

        // 2. TABELA PIVOT: DISCIPLINAS <-> TURMAS
        Schema::create('disciplina_turma', function (Blueprint $table) {
            $table->unsignedBigInteger('id_disciplina');
            $table->unsignedBigInteger('id_turma');

            $table->foreign('id_disciplina')->references('id')->on('Disciplinas')->onDelete('cascade');
            $table->foreign('id_turma')->references('id')->on('Turmas')->onDelete('cascade');

            $table->primary(['id_disciplina', 'id_turma']);
        });

        // 3. TABELA PIVOT: DISCIPLINAS <-> PROFESSORES
        Schema::create('disciplina_professor', function (Blueprint $table) {
            $table->unsignedBigInteger('id_disciplina');
            $table->unsignedBigInteger('id_professor');

            $table->foreign('id_disciplina')->references('id')->on('Disciplinas')->onDelete('cascade');
            $table->foreign('id_professor')->references('id')->on('users')->onDelete('cascade');

            $table->primary(['id_disciplina', 'id_professor']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disciplina_professor');
        Schema::dropIfExists('disciplina_turma');
        Schema::dropIfExists('Disciplinas');
    }
};