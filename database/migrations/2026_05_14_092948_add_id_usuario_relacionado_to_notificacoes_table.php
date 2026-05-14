<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('Notificacoes', function (Blueprint $table) {
            $table->unsignedBigInteger('id_usuario_relacionado')->nullable()->after('id_desafio_relacionado');
        });
    }

    public function down(): void
    {
        Schema::table('Notificacoes', function (Blueprint $table) {
            $table->dropColumn('id_usuario_relacionado');
        });
    }
};
