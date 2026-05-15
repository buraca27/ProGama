<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['id_nivel']);
            $table->dropColumn(['xp_total', 'id_nivel']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('xp_total')->default(0);
            $table->unsignedBigInteger('id_nivel')->default(1)->nullable();
        });
    }
};
