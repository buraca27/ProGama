<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Desafio', function (Blueprint $table) {
            $table->id();

            // Core fields (present in both Testes and Desafios)
            $table->string('titulo', 255);
            $table->text('descricao')->nullable();
            $table->unsignedBigInteger('id_formador');
            $table->dateTime('data_inicio');
            $table->dateTime('data_fim');
            $table->unsignedInteger('duracao_minutos')->nullable();
            $table->boolean('ativa')->default(true);

            // From Testes
            $table->enum('tipo_avaliacao', ['Continua', 'Summativa', 'Diagnóstica', 'Formativa']);
            $table->decimal('peso_nota', 5, 2)->default(1.0); // From peso_avaliacao
            $table->string('url_anexo_global', 255)->nullable();

            // From Desafios
            $table->boolean('exige_submissao')->default(false);
            $table->integer('cooldown_minutos')->nullable();
            $table->enum('tipo_recorrencia', ['Unico', 'Diario', 'Semanal', 'Mensal'])->default('Unico');
            $table->unsignedBigInteger('id_teste_associado')->nullable();

            // Distinção de tipo (Quiz=Testes, Tarefa=Desafios)
            $table->enum('tipo_desafio', ['Quiz', 'Tarefa'])->default('Quiz');

            // Gamificação
            $table->unsignedInteger('xp_base')->default(1);
            $table->json('badges_json')->nullable();
            $table->boolean('auto_award_xp')->default(true);

            // Auditoria
            $table->timestamps();

            $table->foreign('id_formador')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Desafio');
    }
};
