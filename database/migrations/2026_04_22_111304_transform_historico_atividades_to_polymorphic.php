<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alterado aqui: 'Historico_Atividades'
        Schema::table('Historico_Atividades', function (Blueprint $table) {
            $table->nullableMorphs('referencia');
        });

        $map = [
            'Desafio_Concluido' => 'App\Models\Desafio',
            'Teste_Finalizado'  => 'App\Models\Teste',
            'Badge_Manual_Recebido' => 'App\Models\Badge',
        ];

        foreach ($map as $tipoAntigo => $modelClass) {
            
            DB::table('Historico_Atividades')
                ->where('tipo_atividade', $tipoAntigo)
                ->update([
                    'referencia_type' => $modelClass,
                    'referencia_id'   => DB::raw('id_referencia')
                ]);
        }

        
        Schema::table('Historico_Atividades', function (Blueprint $table) {
            $table->dropColumn(['tipo_atividade', 'id_referencia']);
        });
    }

    public function down(): void
    {
        // Alterado aqui: 'Historico_Atividades'
        Schema::table('Historico_Atividades', function (Blueprint $table) {
            $table->string('tipo_atividade')->nullable();
            $table->integer('id_referencia')->nullable();
        });

        $map = [
            'App\Models\Desafio' => 'Desafio_Concluido',
            'App\Models\Teste'   => 'Teste_Finalizado',
            'App\Models\Badge'   => 'Badge_Manual_Recebido',
        ];

        foreach ($map as $modelClass => $tipoAntigo) {
           
            DB::table('Historico_Atividades')
                ->where('referencia_type', $modelClass)
                ->update([
                    'tipo_atividade' => $tipoAntigo,
                    'id_referencia'  => DB::raw('referencia_id')
                ]);
        }

       
        Schema::table('Historico_Atividades', function (Blueprint $table) {
            $table->dropMorphs('referencia');
        });
    }
};