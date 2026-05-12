<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('Respostas_Alunos', function (Blueprint $table) {
            $table->unique(['id_teste_realizado', 'id_pergunta'], 'uq_resposta_por_pergunta');
            $table->index('id_teste_realizado', 'idx_respostas_teste_realizado');
        });

        Schema::table('Testes_Realizados', function (Blueprint $table) {
            $table->index(['id_teste', 'estado'], 'idx_teste_realizado_estado');
            $table->index('id_aluno', 'idx_teste_realizado_aluno');

            $table->unsignedBigInteger('corrigido_por')->nullable()->after('estado');
            $table->dateTime('corrigido_em')->nullable()->after('corrigido_por');
            $table->dateTime('publicado_em')->nullable()->after('corrigido_em');

            $table->foreign('corrigido_por')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('Testes_Realizados', function (Blueprint $table) {
            $table->dropForeign(['corrigido_por']);
            $table->dropColumn(['corrigido_por', 'corrigido_em', 'publicado_em']);

            $table->dropIndex('idx_teste_realizado_estado');
            $table->dropIndex('idx_teste_realizado_aluno');
        });

        Schema::table('Respostas_Alunos', function (Blueprint $table) {
            $table->dropUnique('uq_resposta_por_pergunta');
            $table->dropIndex('idx_respostas_teste_realizado');
        });
    }
};
