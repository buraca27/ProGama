<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Recriar a tabela Categorias (agora com descricao)
        Schema::create('Categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100)->unique();
            $table->text('descricao')->nullable();
            $table->timestamps();
        });

        // 2. Restaurar id_categoria e FK na tabela Perguntas
        Schema::table('Perguntas', function (Blueprint $table) {
            $table->unsignedBigInteger('id_categoria')->nullable()->after('url_anexo_pergunta');
            $table->foreign('id_categoria')->references('id')->on('Categorias')->onDelete('set null');
        });

        // 3. Adicionar id_categoria à tabela Testes
        Schema::table('Testes', function (Blueprint $table) {
            $table->unsignedBigInteger('id_categoria')->nullable()->after('id_formador');
            $table->foreign('id_categoria')->references('id')->on('Categorias')->onDelete('set null');
        });

        // 4. Adicionar id_categoria à tabela Desafios
        Schema::table('Desafios', function (Blueprint $table) {
            $table->unsignedBigInteger('id_categoria')->nullable()->after('id_formador');
            $table->foreign('id_categoria')->references('id')->on('Categorias')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('Perguntas', function (Blueprint $table) {
            $table->dropForeign(['id_categoria']);
            $table->dropColumn('id_categoria');
        });

        Schema::table('Testes', function (Blueprint $table) {
            $table->dropForeign(['id_categoria']);
            $table->dropColumn('id_categoria');
        });

        Schema::table('Desafios', function (Blueprint $table) {
            $table->dropForeign(['id_categoria']);
            $table->dropColumn('id_categoria');
        });

        Schema::dropIfExists('Categorias');
    }
};
