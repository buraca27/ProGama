<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('Desafio')) {
            Schema::table('Desafio', function (Blueprint $table) {
                if (!Schema::hasColumn('Desafio', 'id_categoria')) {
                    $table->unsignedBigInteger('id_categoria')->nullable()->after('id_formador');
                    $table->foreign('id_categoria')
                        ->references('id')
                        ->on('Categorias')
                        ->onDelete('set null');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('Desafio')) {
            Schema::table('Desafio', function (Blueprint $table) {
                if (Schema::hasColumn('Desafio', 'id_categoria')) {
                    $table->dropForeign(['id_categoria']);
                    $table->dropColumn('id_categoria');
                }
            });
        }
    }
};
