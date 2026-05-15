<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('Testes', function (Blueprint $table) {
            $table->dateTime('data_hora_abertura')->nullable()->change();
            $table->dateTime('data_hora_fecho')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('Testes', function (Blueprint $table) {
            $table->dateTime('data_hora_abertura')->nullable(false)->change();
            $table->dateTime('data_hora_fecho')->nullable(false)->change();
        });
    }
};
