<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop das tabelas antigas de Testes
        if (Schema::hasTable('Testes_Realizados')) {
            Schema::drop('Testes_Realizados');
        }

        if (Schema::hasTable('Testes_Atribuicoes')) {
            Schema::drop('Testes_Atribuicoes');
        }

        if (Schema::hasTable('Testes_Perguntas')) {
            Schema::drop('Testes_Perguntas');
        }

        if (Schema::hasTable('Testes')) {
            Schema::drop('Testes');
        }

        // Drop das tabelas antigas de Desafios (não consolidadas)
        if (Schema::hasTable('Desafios_Atribuicoes')) {
            Schema::drop('Desafios_Atribuicoes');
        }

        if (Schema::hasTable('Regras_Recompensa_Desafio')) {
            Schema::drop('Regras_Recompensa_Desafio');
        }

        if (Schema::hasTable('Inscricoes_Desafios')) {
            Schema::drop('Inscricoes_Desafios');
        }

        if (Schema::hasTable('Desafios')) {
            Schema::drop('Desafios');
        }

        // Remover coluna id_teste da tabela Notificacoes se existir
        if (Schema::hasTable('Notificacoes') && Schema::hasColumn('Notificacoes', 'id_teste')) {
            Schema::table('Notificacoes', function (Blueprint $table) {
                $table->dropColumn('id_teste');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Não fazer rollback - tabelas de Testes não devem ser recriadas
    }
};
