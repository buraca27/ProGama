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

        // Add new notification types if they are not already present.
        DB::statement("ALTER TABLE `Notificacoes` MODIFY `tipo_notificacao` ENUM('Novo_Teste', 'Novo_Desafio', 'Teste_Corrigido', 'Badge_Ganho', 'Aviso_Sistema', 'Pedido_Conexao', 'Conexao_Aceite', 'Conexao_Recusada') NOT NULL");
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
