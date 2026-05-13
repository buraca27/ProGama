<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration fixes the Respostas_Desafios_Alunos table to reference
     * Submissoes_Desafio_Aluno instead of the deleted Inscricoes_Desafios table.
     */
    public function up(): void
    {
        if (!Schema::hasTable('Respostas_Desafios_Alunos')) {
            return; // Table doesn't exist, nothing to fix
        }

        // Step 1: Drop the old broken foreign key constraint
        try {
            DB::statement('ALTER TABLE `Respostas_Desafios_Alunos` DROP FOREIGN KEY `respostas_desafios_alunos_id_inscricao_desafio_foreign`');
        } catch (\Exception $e) {
            // Ignore if FK doesn't exist
        }

        // Step 2: Drop unique constraint if it exists
        try {
            DB::statement('ALTER TABLE `Respostas_Desafios_Alunos` DROP INDEX `uniq_desafio_inscricao_pergunta`');
        } catch (\Exception $e) {
            // Ignore if index doesn't exist
        }

        // Step 3: Rename the column from id_inscricao_desafio to id_submissao
        if (Schema::hasColumn('Respostas_Desafios_Alunos', 'id_inscricao_desafio')) {
            DB::statement('ALTER TABLE `Respostas_Desafios_Alunos` CHANGE COLUMN `id_inscricao_desafio` `id_submissao` BIGINT UNSIGNED NOT NULL');
        }

        // Step 4: Add the new foreign key to Submissoes_Desafio_Aluno
        try {
            DB::statement('ALTER TABLE `Respostas_Desafios_Alunos` ADD CONSTRAINT `respostas_desafios_alunos_id_submissao_foreign` FOREIGN KEY (`id_submissao`) REFERENCES `Submissoes_Desafio_Aluno` (`id`) ON DELETE CASCADE');
        } catch (\Exception $e) {
            // Foreign key might already exist
        }

        // Step 5: Add new unique constraint based on id_submissao and id_pergunta
        try {
            DB::statement('ALTER TABLE `Respostas_Desafios_Alunos` ADD UNIQUE KEY `uniq_submissao_pergunta` (`id_submissao`, `id_pergunta`)');
        } catch (\Exception $e) {
            // Unique constraint might already exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('Respostas_Desafios_Alunos')) {
            return;
        }

        // Note: This is a non-reversible migration since Inscricoes_Desafios table is gone
        // We can only revert the column name and constraint names, not the actual data integrity

        try {
            DB::statement('ALTER TABLE `Respostas_Desafios_Alunos` DROP FOREIGN KEY `respostas_desafios_alunos_id_submissao_foreign`');
        } catch (\Exception $e) {
            // Ignore
        }

        try {
            DB::statement('ALTER TABLE `Respostas_Desafios_Alunos` DROP INDEX `uniq_submissao_pergunta`');
        } catch (\Exception $e) {
            // Ignore
        }

        // Rename column back (though the table structure is now incompatible with Inscricoes_Desafios)
        if (Schema::hasColumn('Respostas_Desafios_Alunos', 'id_submissao')) {
            DB::statement('ALTER TABLE `Respostas_Desafios_Alunos` CHANGE COLUMN `id_submissao` `id_inscricao_desafio` BIGINT UNSIGNED NOT NULL');
        }
    }
};
