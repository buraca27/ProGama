<?php

namespace Database\Seeders;

<<<<<<< HEAD
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

=======
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
>>>>>>> origin/team-b/rafael-oliveira
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
<<<<<<< HEAD
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
=======
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
>>>>>>> origin/team-b/rafael-oliveira
