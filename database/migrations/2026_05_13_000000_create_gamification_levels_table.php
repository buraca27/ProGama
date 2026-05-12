<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Levels', function (Blueprint $table) {
            $table->id();
            $table->integer('nivel')->unique(); // 1, 2, 3, ..., 15
            $table->unsignedInteger('xp_requerido'); // Fibonacci: 1, 1, 2, 3, 5, 8, 13, 21, ...
            $table->string('nome_nivel', 100)->nullable(); // ex: "Aprendiz", "Experiente", etc
            $table->text('descricao')->nullable();
            $table->timestamps();
        });

        // Popular com os níveis Fibonacci até 1000 XP máximo
        $this->seedFibonacciLevels();
    }

    public function down(): void
    {
        Schema::dropIfExists('Levels');
    }

    private function seedFibonacciLevels(): void
    {
        $fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610];
        $nivelNames = [
            'Iniciante', 'Aprendiz', 'Estudante', 'Dedicado', 'Competente',
            'Proficiente', 'Avançado', 'Perito', 'Mestre', 'Erudito',
            'Sábio', 'Ilustre', 'Lendário', 'Mítico', 'Supremo'
        ];

        foreach ($fibonacci as $index => $xp) {
            \DB::table('Levels')->insert([
                'nivel' => $index + 1,
                'xp_requerido' => $xp,
                'nome_nivel' => $nivelNames[$index] ?? "Nível " . ($index + 1),
                'descricao' => "Requer " . $xp . " XP para alcançar",
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
};
