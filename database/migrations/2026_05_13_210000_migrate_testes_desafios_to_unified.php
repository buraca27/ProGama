<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('Desafio')) {
            return;
        }

        if (Schema::hasTable('Desafios')) {
            // Migrate Desafios -> Desafio (tipo_desafio = 'Tarefa')
            DB::statement("
                INSERT INTO Desafio (
                    titulo, descricao, id_formador, data_inicio, data_fim,
                    tipo_avaliacao, ativa, duracao_minutos,
                    tipo_desafio, xp_base, auto_award_xp,
                    created_at, updated_at
                )
                SELECT
                    d.titulo, d.descricao,
                    COALESCE(d.id_formador, (SELECT COALESCE(MIN(id), 1) FROM users)),
                    COALESCE(d.data_inicio, NOW()),
                    COALESCE(d.data_fim, DATE_ADD(NOW(), INTERVAL 7 DAY)),
                    'Summativa', d.ativo, d.duracao_minutos,
                    'Tarefa', 50, true,
                    d.created_at, d.updated_at
                FROM Desafios d
            ");
        }
    }

    public function down(): void
    {
        // Rollback: Clear all data from Desafio table
        DB::statement('DELETE FROM Desafio');
    }
};
