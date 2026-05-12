<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Create unified Atribuicoes_Desafio table if it doesn't exist
        if (!Schema::hasTable('Atribuicoes_Desafio')) {
            Schema::create('Atribuicoes_Desafio', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('id_desafio');
                $table->unsignedBigInteger('id_turma')->nullable();
                $table->unsignedBigInteger('id_grupo')->nullable();
                $table->unsignedBigInteger('id_aluno')->nullable();
                $table->dateTime('data_inicio_tentativas')->nullable();
                $table->dateTime('data_fim_tentativas')->nullable();
                $table->unsignedInteger('tentativas_maximas')->nullable();
                $table->text('observacoes')->nullable();
                $table->timestamps();

                $table->foreign('id_desafio')->references('id')->on('Desafio')->onDelete('cascade');
                $table->foreign('id_turma')->references('id')->on('Turmas')->onDelete('cascade');
                $table->foreign('id_aluno')->references('id')->on('users')->onDelete('cascade');
            });
        }

        // Migrate data from old assignments if tables exist
        // Try to migrate from Testes_Atribuicoes
        if (Schema::hasTable('Testes_Atribuicoes')) {
            try {
                DB::statement("
                    INSERT IGNORE INTO Atribuicoes_Desafio (
                        id_desafio, id_turma, id_aluno,
                        data_inicio_tentativas, data_fim_tentativas, tentativas_maximas,
                        created_at, updated_at
                    )
                    SELECT
                        ta.id_teste, ta.id_turma, ta.id_aluno,
                        ta.data_inicio_tentativas, ta.data_fim_tentativas, ta.tentativas_maximas,
                        ta.created_at, ta.updated_at
                    FROM Testes_Atribuicoes ta
                ");
            } catch (\Exception $e) {
                // If migration fails, just continue - the table exists
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('Atribuicoes_Desafio');
    }
};
