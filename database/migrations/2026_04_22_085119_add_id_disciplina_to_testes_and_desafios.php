<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Atualizar a tabela Testes
        Schema::table('Testes', function (Blueprint $table) {
            // NOTA: Como já tens dados, a coluna TEM de ser nullable() ou ter um valor default.
            // Caso contrário o MySQL dá erro porque não sabe o que pôr nos testes que já existem.
            $table->unsignedBigInteger('id_disciplina')->nullable()->after('id_formador');
            
            // Adicionar a chave estrangeira (se a disciplina for apagada, o id_disciplina fica a null)
            $table->foreign('id_disciplina')->references('id')->on('Disciplinas')->onDelete('set null');
        });

        // 2. Atualizar a tabela Desafios
        Schema::table('Desafios', function (Blueprint $table) {
            $table->unsignedBigInteger('id_disciplina')->nullable()->after('id_formador');
            
            $table->foreign('id_disciplina')->references('id')->on('Disciplinas')->onDelete('set null');
        });
    }

    public function down(): void
    {
        // Para reverter (rollback), temos de apagar a foreign key primeiro e depois a coluna
        Schema::table('Testes', function (Blueprint $table) {
            $table->dropForeign(['id_disciplina']);
            $table->dropColumn('id_disciplina');
        });

        Schema::table('Desafios', function (Blueprint $table) {
            $table->dropForeign(['id_disciplina']);
            $table->dropColumn('id_disciplina');
        });
    }
};