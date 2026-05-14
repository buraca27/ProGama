<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Atribuicoes_Desafio', function (Blueprint $table) {
            if (!Schema::hasColumn('Atribuicoes_Desafio', 'sem_consulta')) {
                $table->boolean('sem_consulta')->default(false)->after('tentativas_maximas');
            }
        });
    }

    public function down(): void
    {
        Schema::table('Atribuicoes_Desafio', function (Blueprint $table) {
            if (Schema::hasColumn('Atribuicoes_Desafio', 'sem_consulta')) {
                $table->dropColumn('sem_consulta');
            }
        });
    }
};
