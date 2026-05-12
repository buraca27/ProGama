<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create unified submission tracking table
        Schema::create('Submissoes_Desafio_Aluno', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_desafio');
            $table->unsignedBigInteger('id_aluno');
            $table->unsignedBigInteger('id_atribuicao');
            $table->enum('estado', [
                'Pendente',
                'Em_Resolucao',
                'Submetido',
                'Avaliado',
                'Falhado',
                'Concluido'
            ])->default('Pendente');
            $table->decimal('nota', 5, 2)->nullable(); // Grade (0-100)
            $table->text('feedback_professor')->nullable();
            $table->unsignedInteger('numero_tentativa')->default(1); // For Quiz type
            $table->dateTime('data_inicio_resolucao')->nullable();
            $table->dateTime('data_submissao')->nullable();
            $table->unsignedInteger('duracao_segundos')->nullable(); // How long they spent
            $table->json('metadata')->nullable(); // Additional data (browser info, IP, etc)
            $table->timestamps();

            $table->foreign('id_desafio')->references('id')->on('Desafio')->onDelete('cascade');
            $table->foreign('id_aluno')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_atribuicao')->references('id')->on('Atribuicoes_Desafio')->onDelete('cascade');

            // Unique constraint: one submission per student per challenge per attempt
            $table->unique(['id_desafio', 'id_aluno', 'numero_tentativa'], 'submissao_unica_desafio_aluno');
        });

        // Create unified responses table (for individual question responses)
        Schema::create('Respostas_Desafio_Aluno', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_submissao');
            $table->unsignedBigInteger('id_pergunta');
            $table->text('resposta_texto')->nullable(); // For essay questions
            $table->json('ids_opcoes_escolhidas')->nullable(); // For MCQ: array of option IDs
            $table->boolean('correta')->nullable(); // Is the response correct? (auto-filled for MCQ)
            $table->decimal('pontuacao', 5, 2)->nullable(); // Points earned for this question
            $table->timestamps();

            $table->foreign('id_submissao')->references('id')->on('Submissoes_Desafio_Aluno')->onDelete('cascade');
            $table->foreign('id_pergunta')->references('id')->on('Perguntas')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Respostas_Desafio_Aluno');
        Schema::dropIfExists('Submissoes_Desafio_Aluno');
    }
};
