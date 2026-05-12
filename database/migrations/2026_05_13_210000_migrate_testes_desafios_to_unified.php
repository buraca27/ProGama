<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Migrate Testes → Desafio (tipo_desafio = 'Quiz')
        DB::statement("
            INSERT INTO Desafio (
                titulo, id_formador, data_inicio, data_fim,
                tipo_avaliacao, ativa, peso_nota, tipo_desafio, xp_base, auto_award_xp,
                created_at, updated_at
            )
            SELECT
                titulo,
                COALESCE(id_formador, (SELECT COALESCE(MIN(id), 1) FROM users)),
                COALESCE(data_hora_abertura, NOW()),
                COALESCE(data_hora_fecho, DATE_ADD(NOW(), INTERVAL 7 DAY)),
                CASE tipo_avaliacao
                    WHEN 'Teste_Formal' THEN 'Summativa'
                    WHEN 'Ficha_Trabalho' THEN 'Formativa'
                    WHEN 'Exame_Final' THEN 'Summativa'
                    ELSE 'Continua'
                END,
                true, COALESCE(peso_avaliacao, 1.0), 'Quiz', 50, true,
                created_at, updated_at
            FROM Testes
        ");

        // Migrate Desafios → Desafio (tipo_desafio = 'Tarefa')
        DB::statement("
            INSERT INTO Desafio (
                titulo, descricao, id_formador, data_inicio, data_fim,
                tipo_avaliacao, ativa, duracao_minutos,
                tipo_desafio, xp_base, auto_award_xp,
                created_at, updated_at
            )
            SELECT
                titulo, descricao,
                COALESCE(id_formador, (SELECT COALESCE(MIN(id), 1) FROM users)),
                COALESCE(data_inicio, NOW()),
                COALESCE(data_fim, DATE_ADD(NOW(), INTERVAL 7 DAY)),
                'Summativa', ativo, duracao_minutos,
                'Tarefa', 50, true,
                created_at, updated_at
            FROM Desafios
        ");
    }

    public function down(): void
    {
        // Rollback: Clear all data from Desafio table
        DB::statement('DELETE FROM Desafio');
    }
};
