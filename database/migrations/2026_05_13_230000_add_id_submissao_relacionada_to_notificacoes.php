<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('Notificacoes', 'id_submissao_relacionada')) {
            Schema::table('Notificacoes', function (Blueprint $table) {
                $table->unsignedBigInteger('id_submissao_relacionada')->nullable()->after('id_desafio_relacionado');
            });
        }
    }

    public function down(): void
    {
        Schema::table('Notificacoes', function (Blueprint $table) {
            if (Schema::hasColumn('Notificacoes', 'id_submissao_relacionada')) {
                $table->dropColumn('id_submissao_relacionada');
            }
        });
    }
};
