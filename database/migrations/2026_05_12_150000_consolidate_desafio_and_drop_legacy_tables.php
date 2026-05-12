<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('Desafios_Perguntas') && Schema::hasTable('Desafio')) {
            // Remove legacy FK to Desafios if present.
            try {
                DB::statement('ALTER TABLE `Desafios_Perguntas` DROP FOREIGN KEY `desafios_perguntas_id_desafio_foreign`');
            } catch (\Throwable $e) {
                // Ignore when FK name differs or has already been removed.
            }

            // Clean rows that cannot be linked to unified Desafio table.
            DB::statement(
                'DELETE dp FROM `Desafios_Perguntas` dp LEFT JOIN `Desafio` d ON d.id = dp.id_desafio WHERE d.id IS NULL'
            );

            try {
                DB::statement(
                    'ALTER TABLE `Desafios_Perguntas` ADD CONSTRAINT `desafios_perguntas_id_desafio_foreign` FOREIGN KEY (`id_desafio`) REFERENCES `Desafio` (`id`) ON DELETE CASCADE'
                );
            } catch (\Throwable $e) {
                // Ignore if FK already exists.
            }
        }

        if (Schema::hasTable('Notificacoes')) {
            Schema::table('Notificacoes', function (Blueprint $table) {
                try {
                    $table->dropForeign(['id_teste']);
                } catch (\Throwable $e) {
                    // Ignore if foreign key does not exist in this environment.
                }

                try {
                    $table->dropForeign(['id_desafio']);
                } catch (\Throwable $e) {
                    // Ignore if foreign key does not exist in this environment.
                }
            });
        }

        // Drop legacy tables no longer used by unified Desafio domain.
        Schema::dropIfExists('Respostas_Alunos');
        Schema::dropIfExists('Testes_Realizados');
        Schema::dropIfExists('Testes_Atribuicoes');
        Schema::dropIfExists('Testes_Perguntas');
        Schema::dropIfExists('Testes');

        Schema::dropIfExists('Desafios_Atribuicoes');
        Schema::dropIfExists('Regras_Recompensa_Desafio');
        Schema::dropIfExists('Inscricoes_Desafios');
        Schema::dropIfExists('Desafios');
    }

    public function down(): void
    {
        // Irreversible: legacy schema is intentionally removed.
    }
};
