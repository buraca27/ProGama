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
        // Drop das tabelas Testes na ordem correta (sem DROP se não existirem)
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
