<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('Testes_Atribuicoes', function (Blueprint $table) {
            $table->unsignedTinyInteger('tentativas_maximas')->nullable()->after('data_hora_fecho');
        });
    }

    public function down(): void
    {
        Schema::table('Testes_Atribuicoes', function (Blueprint $table) {
            $table->dropColumn('tentativas_maximas');
        });
    }
};
