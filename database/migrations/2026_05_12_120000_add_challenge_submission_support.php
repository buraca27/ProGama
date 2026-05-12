<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('Respostas_Desafios_Alunos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_inscricao_desafio');
            $table->unsignedBigInteger('id_pergunta');
            $table->unsignedBigInteger('id_opcao_escolhida')->nullable();
            $table->json('ids_opcoes_escolhidas')->nullable();
            $table->text('resposta_texto')->nullable();
            $table->string('url_ficheiro_submetido', 255)->nullable();
            $table->enum('status_correcao', ['Correto', 'Errado', 'Por_Avaliar'])->default('Por_Avaliar');
            $table->integer('pontuacao_obtida')->default(0);
            $table->text('comentario_formador')->nullable();
            $table->timestamps();

            $table->foreign('id_inscricao_desafio')
                ->references('id')
                ->on('Inscricoes_Desafios')
                ->onDelete('cascade');

            $table->foreign('id_pergunta')
                ->references('id')
                ->on('Perguntas')
                ->onDelete('cascade');

            $table->foreign('id_opcao_escolhida')
                ->references('id')
                ->on('Opcoes_Pergunta')
                ->onDelete('set null');

            $table->unique(['id_inscricao_desafio', 'id_pergunta'], 'uniq_desafio_inscricao_pergunta');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Respostas_Desafios_Alunos');
    }
};
