<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Desafio', function (Blueprint $table) {
            if (!Schema::hasColumn('Desafio', 'anexos_professor_json')) {
                $table->json('anexos_professor_json')->nullable()->after('url_anexo_global');
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
