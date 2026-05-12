<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Preserve question weights from legacy pivot when a linked challenge exists.
        if (
            Schema::hasTable('Testes_Perguntas')
            && Schema::hasTable('Desafios_Perguntas')
            && Schema::hasTable('Desafio')
            && Schema::hasColumn('Desafio', 'id_teste_associado')
        ) {
            DB::statement(
                "
                INSERT IGNORE INTO Desafios_Perguntas (id_desafio, id_pergunta, pontuacao_extra, created_at, updated_at)
                SELECT d.id, tp.id_pergunta, COALESCE(tp.valor_pontuacao, 1), NOW(), NOW()
                FROM Testes_Perguntas tp
                INNER JOIN Desafio d ON d.id_teste_associado = tp.id_teste
                "
            );
        }

        if (Schema::hasTable('Desafio') && Schema::hasColumn('Desafio', 'id_teste_associado')) {
            Schema::table('Desafio', function (Blueprint $table) {
                try {
                    $table->dropForeign(['id_teste_associado']);
                } catch (\Throwable $e) {
                    // Ignore if foreign key does not exist in this environment.
                }
            });

            Schema::table('Desafio', function (Blueprint $table) {
                $table->dropColumn('id_teste_associado');
            });
        }

        // Safety gate: enable only when all legacy references are removed.
        if ((bool) env('ALLOW_DROP_TESTES_TABLES', false)) {
            Schema::dropIfExists('Respostas_Alunos');
            Schema::dropIfExists('Testes_Realizados');
            Schema::dropIfExists('Testes_Atribuicoes');
            Schema::dropIfExists('Testes_Perguntas');
            Schema::dropIfExists('Testes');
        }
    }

    public function down(): void
    {
        // Legacy rollback intentionally omitted.
    }
};
