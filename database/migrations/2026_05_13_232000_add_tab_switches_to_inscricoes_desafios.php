<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('Inscricoes_Desafios', function (Blueprint $table) {
            if (!Schema::hasColumn('Inscricoes_Desafios', 'tab_switches')) {
                $table->unsignedSmallInteger('tab_switches')->default(0)->after('data_ultima_tentativa');
            }
        });
    }

    public function down(): void
    {
        Schema::table('Inscricoes_Desafios', function (Blueprint $table) {
            if (Schema::hasColumn('Inscricoes_Desafios', 'tab_switches')) {
                $table->dropColumn('tab_switches');
            }
        });
    }
};
