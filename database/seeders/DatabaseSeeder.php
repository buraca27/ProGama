<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Criar o Nível 1 Obrigatório (para os utilizadores poderem ser criados)
        DB::table('Niveis')->insert([
            'id' => 1,
            'numero_nivel' => 1,
            'xp_minimo' => 0,
            'titulo_nivel' => 'Iniciante',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Já que estamos aqui, vamos criar também os Cargos (Roles) base do sistema
        DB::table('Roles')->insert([
            ['id' => 1, 'nome' => 'admin', 'descricao' => 'Administrador do Sistema', 'created_at' => now()],
            ['id' => 2, 'nome' => 'professor', 'descricao' => 'Professor / Formador', 'created_at' => now()],
            ['id' => 3, 'nome' => 'aluno', 'descricao' => 'Aluno / Formando', 'created_at' => now()],
        ]);
    }
}