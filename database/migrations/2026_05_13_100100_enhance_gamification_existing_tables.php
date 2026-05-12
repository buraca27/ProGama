<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Enhance Badges table with gamification fields
        Schema::table('Badges', function (Blueprint $table) {
            $table->enum('tipo_criterio', ['Pontuacao', 'Velocidade', 'Consistencia', 'Criatividade', 'Lideranca'])->nullable()->after('descricao');
            $table->integer('valor_criterio')->nullable()->after('tipo_criterio');
            $table->boolean('ativa')->default(true)->after('valor_criterio');
            $table->integer('raridade')->default(1)->after('ativa'); // 1=comum, 2=incomum, 3=raro, 4=lendário
        });

        // Enhance Inventario_Badges table
        Schema::table('Inventario_Badges', function (Blueprint $table) {
            $table->unsignedBigInteger('id_desafio_origem')->nullable()->after('id_badge');
            // Note: Foreign key will be added in a separate migration after Desafio table is created
        });

        // Enhance Notificacoes table
        Schema::table('Notificacoes', function (Blueprint $table) {
            // Add new notification types
            $table->dropColumn('tipo_notificacao');
            $table->enum('tipo_notificacao', [
                'Novo_Teste',
                'Novo_Desafio',
                'Teste_Corrigido',
                'Badge_Ganho',
                'Aviso_Sistema',
                'XP_Recebido',
                'Novo_Nivel',
                'Prazo_Proximo'
            ])->after('id_utilizador');
            // Add column to track which Desafio triggered this notification
            $table->unsignedBigInteger('id_desafio_relacionado')->nullable()->after('id_desafio');
        });
    }

    public function down(): void
    {
        Schema::table('Badges', function (Blueprint $table) {
            $table->dropColumn(['tipo_criterio', 'valor_criterio', 'ativa', 'raridade']);
        });

        Schema::table('Inventario_Badges', function (Blueprint $table) {
            $table->dropColumn('id_desafio_origem');
        });

        Schema::table('Notificacoes', function (Blueprint $table) {
            $table->dropColumn('tipo_notificacao');
            $table->enum('tipo_notificacao', ['Novo_Teste', 'Novo_Desafio', 'Teste_Corrigido', 'Badge_Ganho', 'Aviso_Sistema'])->after('id_utilizador');
        });
    }
};
