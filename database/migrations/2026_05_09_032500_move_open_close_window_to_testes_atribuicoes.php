<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('Testes_Atribuicoes', function (Blueprint $table) {
            $table->dateTime('data_hora_abertura')->nullable()->after('id_aluno');
            $table->dateTime('data_hora_fecho')->nullable()->after('data_hora_abertura');
            $table->index(['id_turma', 'data_hora_abertura', 'data_hora_fecho'], 'idx_tarefas_turma_janela');
        });

        $atribuicoes = DB::table('Testes_Atribuicoes as ta')
            ->join('Testes as t', 't.id', '=', 'ta.id_teste')
            ->select('ta.id', 't.data_hora_abertura', 't.data_hora_fecho')
            ->get();

        foreach ($atribuicoes as $atribuicao) {
            DB::table('Testes_Atribuicoes')
                ->where('id', '=', $atribuicao->id)
                ->update([
                    'data_hora_abertura' => $atribuicao->data_hora_abertura,
                    'data_hora_fecho' => $atribuicao->data_hora_fecho,
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('Testes_Atribuicoes', function (Blueprint $table) {
            $table->dropIndex('idx_tarefas_turma_janela');
            $table->dropColumn(['data_hora_abertura', 'data_hora_fecho']);
        });
    }
};
