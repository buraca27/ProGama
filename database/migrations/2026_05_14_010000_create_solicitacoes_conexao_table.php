<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('Solicitacoes_Conexao')) {
            return;
        }

        Schema::create('Solicitacoes_Conexao', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_solicitante');
            $table->unsignedBigInteger('id_destinatario');
            $table->enum('estado', ['pendente', 'aceite', 'recusado'])->default('pendente');
            $table->timestamps();

            $table->unique(['id_solicitante', 'id_destinatario'], 'uniq_solicitante_destinatario');
            $table->foreign('id_solicitante')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_destinatario')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Solicitacoes_Conexao');
    }
};
