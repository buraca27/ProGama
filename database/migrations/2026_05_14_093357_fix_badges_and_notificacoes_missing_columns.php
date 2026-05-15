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
        Schema::table('Badges', function (Blueprint $table) {
            if (Schema::hasColumn('Badges', 'imagem_url') && !Schema::hasColumn('Badges', 'icone_url')) {
                $table->renameColumn('imagem_url', 'icone_url');
            }
            if (!Schema::hasColumn('Badges', 'tipo_criterio')) {
                $table->string('tipo_criterio', 100)->nullable()->after('icone_url');
            }
            if (!Schema::hasColumn('Badges', 'valor_criterio')) {
                $table->integer('valor_criterio')->nullable()->after('tipo_criterio');
            }
            if (!Schema::hasColumn('Badges', 'ativa')) {
                $table->boolean('ativa')->default(true)->after('valor_criterio');
            }
            if (!Schema::hasColumn('Badges', 'raridade')) {
                $table->string('raridade', 50)->nullable()->after('ativa');
            }
        });

        Schema::table('Notificacoes', function (Blueprint $table) {
            if (Schema::hasColumn('Notificacoes', 'id_desafio') && !Schema::hasColumn('Notificacoes', 'id_desafio_relacionado')) {
                $table->renameColumn('id_desafio', 'id_desafio_relacionado');
            }
            if (!Schema::hasColumn('Notificacoes', 'id_usuario_relacionado')) {
                $table->unsignedBigInteger('id_usuario_relacionado')->nullable()->after('id_desafio_relacionado');
            }
        });
    }

    public function down(): void
    {
        Schema::table('Badges', function (Blueprint $table) {
            $table->renameColumn('icone_url', 'imagem_url');
            $table->dropColumn(['tipo_criterio', 'valor_criterio', 'ativa', 'raridade']);
        });

        Schema::table('Notificacoes', function (Blueprint $table) {
            $table->renameColumn('id_desafio_relacionado', 'id_desafio');
            $table->dropColumn('id_usuario_relacionado');
        });
    }
};
