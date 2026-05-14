<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('Desafio', 'anexos_professor_json')) {
            return;
        }

        $afterColumn = Schema::hasColumn('Desafio', 'url_anexo_global')
            ? 'url_anexo_global'
            : (Schema::hasColumn('Desafio', 'descricao_ficheiro') ? 'descricao_ficheiro' : null);

        Schema::table('Desafio', function (Blueprint $table) use ($afterColumn) {
            $column = $table->json('anexos_professor_json')->nullable();

            if ($afterColumn) {
                $column->after($afterColumn);
            }
        });
    }

    public function down(): void
    {
        Schema::table('Desafio', function (Blueprint $table) {
            if (Schema::hasColumn('Desafio', 'anexos_professor_json')) {
                $table->dropColumn('anexos_professor_json');
            }
        });
    }
};
