<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('Seguidores') && Schema::hasTable('Seguidores_Usuarios')) {
            $legacyRows = DB::table('Seguidores')
                ->select('id_seguidor', 'id_seguido')
                ->get();

            foreach ($legacyRows as $row) {
                DB::table('Seguidores_Usuarios')->updateOrInsert(
                    [
                        'id_seguidor' => (int) $row->id_seguidor,
                        'id_seguido' => (int) $row->id_seguido,
                    ],
                    [
                        'updated_at' => now(),
                        'created_at' => now(),
                    ],
                );
            }
        }

        if (Schema::hasTable('Roles_Permissoes')) {
            Schema::drop('Roles_Permissoes');
        }

        if (Schema::hasTable('Permissoes')) {
            Schema::drop('Permissoes');
        }

        if (Schema::hasTable('Seguidores')) {
            Schema::drop('Seguidores');
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('Permissoes')) {
            Schema::create('Permissoes', function (Blueprint $table) {
                $table->id();
                $table->string('nome', 100);
                $table->text('descricao')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('Roles_Permissoes')) {
            Schema::create('Roles_Permissoes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('id_role');
                $table->unsignedBigInteger('id_permissao');
                $table->boolean('valor')->default(true);
                $table->text('nota')->nullable();
                $table->timestamps();

                $table->foreign('id_role')->references('id')->on('Roles')->onDelete('cascade');
                $table->foreign('id_permissao')->references('id')->on('Permissoes')->onDelete('cascade');
                $table->unique(['id_role', 'id_permissao']);
            });
        }

        if (!Schema::hasTable('Seguidores')) {
            Schema::create('Seguidores', function (Blueprint $table) {
                $table->unsignedBigInteger('id_seguidor');
                $table->unsignedBigInteger('id_seguido');

                $table->primary(['id_seguidor', 'id_seguido']);
                $table->foreign('id_seguidor')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('id_seguido')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }
};
