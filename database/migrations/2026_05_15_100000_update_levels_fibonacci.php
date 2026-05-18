<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    // Fibonacci sequence starting at F(5)=5 used as cumulative XP thresholds.
    // Level 1 is always 0 (starting point). Levels 2-20 use F(5)..F(23).
    private array $levels = [
        ['nivel' => 1,  'xp' => 0,     'nome' => 'Iniciante'],
        ['nivel' => 2,  'xp' => 5,     'nome' => 'Aprendiz'],
        ['nivel' => 3,  'xp' => 8,     'nome' => 'Estudante'],
        ['nivel' => 4,  'xp' => 13,    'nome' => 'Dedicado'],
        ['nivel' => 5,  'xp' => 21,    'nome' => 'Competente'],
        ['nivel' => 6,  'xp' => 34,    'nome' => 'Proficiente'],
        ['nivel' => 7,  'xp' => 55,    'nome' => 'Avançado'],
        ['nivel' => 8,  'xp' => 89,    'nome' => 'Perito'],
        ['nivel' => 9,  'xp' => 144,   'nome' => 'Mestre'],
        ['nivel' => 10, 'xp' => 233,   'nome' => 'Erudito'],
        ['nivel' => 11, 'xp' => 377,   'nome' => 'Sábio'],
        ['nivel' => 12, 'xp' => 610,   'nome' => 'Ilustre'],
        ['nivel' => 13, 'xp' => 987,   'nome' => 'Lendário'],
        ['nivel' => 14, 'xp' => 1597,  'nome' => 'Mítico'],
        ['nivel' => 15, 'xp' => 2584,  'nome' => 'Supremo'],
        ['nivel' => 16, 'xp' => 4181,  'nome' => 'Transcendente'],
        ['nivel' => 17, 'xp' => 6765,  'nome' => 'Imortal'],
        ['nivel' => 18, 'xp' => 10946, 'nome' => 'Divino'],
        ['nivel' => 19, 'xp' => 17711, 'nome' => 'Eterno'],
        ['nivel' => 20, 'xp' => 28657, 'nome' => 'Absoluto'],
    ];

    public function up(): void
    {
        DB::table('Levels')->delete();

        $now = now();
        foreach ($this->levels as $l) {
            DB::table('Levels')->insert([
                'nivel'       => $l['nivel'],
                'xp_requerido' => $l['xp'],
                'nome_nivel'  => $l['nome'],
                'descricao'   => 'Requer ' . $l['xp'] . ' XP acumulado.',
                'created_at'  => $now,
                'updated_at'  => $now,
            ]);
        }

        // Recalculate any existing User_XP records against the new level table
        $userXpRecords = DB::table('User_XP')->get();
        foreach ($userXpRecords as $record) {
            $nivel = DB::table('Levels')
                ->where('xp_requerido', '<=', $record->xp_total)
                ->orderByDesc('xp_requerido')
                ->value('nivel') ?? 1;

            $proximoXp = DB::table('Levels')
                ->where('nivel', $nivel + 1)
                ->value('xp_requerido') ?? $record->xp_total;

            DB::table('User_XP')->where('id', $record->id)->update([
                'nivel_atual'       => $nivel,
                'xp_proximo_nivel'  => $proximoXp,
                'ultima_atualizacao' => $now,
            ]);
        }
    }

    public function down(): void
    {
        // Restore original small Fibonacci sequence (levels 1-15)
        DB::table('Levels')->delete();
        $original = [1,1,2,3,5,8,13,21,34,55,89,144,233,377,610];
        $names = ['Iniciante','Aprendiz','Estudante','Dedicado','Competente',
                  'Proficiente','Avançado','Perito','Mestre','Erudito',
                  'Sábio','Ilustre','Lendário','Mítico','Supremo'];
        $now = now();
        foreach ($original as $i => $xp) {
            DB::table('Levels')->insert([
                'nivel' => $i + 1, 'xp_requerido' => $xp,
                'nome_nivel' => $names[$i], 'descricao' => "Requer {$xp} XP.",
                'created_at' => $now, 'updated_at' => $now,
            ]);
        }
    }
};
