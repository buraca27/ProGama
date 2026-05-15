<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE Testes MODIFY COLUMN tipo_avaliacao ENUM('Teste_Formal', 'Ficha_Trabalho', 'Exame_Final', 'Desafio') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE Testes MODIFY COLUMN tipo_avaliacao ENUM('Teste_Formal', 'Ficha_Trabalho', 'Exame_Final') NOT NULL");
    }
};
