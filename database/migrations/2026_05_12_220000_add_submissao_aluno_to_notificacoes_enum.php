<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE Notificacoes
            MODIFY COLUMN tipo_notificacao ENUM(
                'Novo_Teste',
                'Novo_Desafio',
                'Teste_Corrigido',
                'Badge_Ganho',
                'Aviso_Sistema',
                'XP_Recebido',
                'Novo_Nivel',
                'Prazo_Proximo',
                'Submissao_Aluno'
            ) NOT NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE Notificacoes
            MODIFY COLUMN tipo_notificacao ENUM(
                'Novo_Teste',
                'Novo_Desafio',
                'Teste_Corrigido',
                'Badge_Ganho',
                'Aviso_Sistema',
                'XP_Recebido',
                'Novo_Nivel',
                'Prazo_Proximo'
            ) NOT NULL
        ");
    }
};
