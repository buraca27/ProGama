<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Respostas_Alunos', function (Blueprint $table) {
            $table->json('ids_opcoes_escolhidas')->nullable()->after('id_opcao_escolhida');
        });
    }

    public function down(): void
    {
        Schema::table('Respostas_Alunos', function (Blueprint $table) {
            $table->dropColumn('ids_opcoes_escolhidas');
        });
    }
};
