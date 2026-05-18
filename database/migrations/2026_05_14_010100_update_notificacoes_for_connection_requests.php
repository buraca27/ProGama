<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('Notificacoes')) {
            return;
        }

        if (!Schema::hasColumn('Notificacoes', 'id_usuario_relacionado')) {
            Schema::table('Notificacoes', function (Blueprint $table) {
                $table->unsignedBigInteger('id_usuario_relacionado')->nullable()->after('id_desafio_relacionado');
            });

            DB::statement('ALTER TABLE `Notificacoes` ADD CONSTRAINT `notificacoes_id_usuario_relacionado_foreign` FOREIGN KEY (`id_usuario_relacionado`) REFERENCES `users`(`id`) ON DELETE SET NULL');
        }

        // Adiciona os novos tipos mantendo os existentes para evitar truncação de dados.
        DB::statement("ALTER TABLE `Notificacoes` MODIFY `tipo_notificacao` ENUM('Novo_Teste','Novo_Desafio','Teste_Corrigido','Desafio_Corrigido','Badge_Ganho','Aviso_Sistema','XP_Recebido','Novo_Nivel','Prazo_Proximo','Submissao_Aluno','Alerta_Integridade','Alteracao_Datas','Pedido_Conexao','Conexao_Aceite','Conexao_Recusada') NOT NULL");
    }

    public function down(): void
    {
        if (!Schema::hasTable('Notificacoes')) {
            return;
        }

        Schema::table('Notificacoes', function (Blueprint $table) {
            if (Schema::hasColumn('Notificacoes', 'id_usuario_relacionado')) {
                $table->dropForeign(['id_usuario_relacionado']);
                $table->dropColumn('id_usuario_relacionado');
            }
        });

        DB::statement("ALTER TABLE `Notificacoes` MODIFY `tipo_notificacao` ENUM('Novo_Teste', 'Novo_Desafio', 'Teste_Corrigido', 'Badge_Ganho', 'Aviso_Sistema') NOT NULL");
    }
};
