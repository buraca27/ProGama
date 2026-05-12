<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add id_desafio_relacionado column to Notificacoes if it doesn't exist
        if (!Schema::hasColumn('Notificacoes', 'id_desafio_relacionado')) {
            Schema::table('Notificacoes', function (Blueprint $table) {
                $table->unsignedBigInteger('id_desafio_relacionado')->nullable()->after('id_desafio');
            });
        }
    }

    public function down(): void
    {
        Schema::table('Notificacoes', function (Blueprint $table) {
            if (Schema::hasColumn('Notificacoes', 'id_desafio_relacionado')) {
                $table->dropColumn('id_desafio_relacionado');
            }
        });
    }
};
