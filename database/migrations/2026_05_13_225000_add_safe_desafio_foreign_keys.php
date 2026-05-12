<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Check if constraint exists and skip if it does
        $constraints = DB::select("
            SELECT CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'Regras_XP_Desafio'
            AND COLUMN_NAME = 'id_desafio'
            AND REFERENCED_TABLE_NAME = 'Desafio'
        ");

        if (empty($constraints)) {
            DB::statement("
                ALTER TABLE Regras_XP_Desafio
                ADD CONSTRAINT regras_xp_desafio_id_desafio_foreign
                FOREIGN KEY (id_desafio) REFERENCES Desafio(id)
                ON DELETE CASCADE
            ");
        }

        // Add foreign key to Inventario_Badges
        if (DB::getSchemaBuilder()->hasColumn('Inventario_Badges', 'id_desafio_origem')) {
            $constraints = DB::select("
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_NAME = 'Inventario_Badges'
                AND COLUMN_NAME = 'id_desafio_origem'
                AND REFERENCED_TABLE_NAME = 'Desafio'
            ");

            if (empty($constraints)) {
                DB::statement("
                    ALTER TABLE Inventario_Badges
                    ADD CONSTRAINT inventario_badges_id_desafio_origem_foreign
                    FOREIGN KEY (id_desafio_origem) REFERENCES Desafio(id)
                    ON DELETE SET NULL
                ");
            }
        }

        // Add foreign key to Notificacoes
        if (DB::getSchemaBuilder()->hasColumn('Notificacoes', 'id_desafio_relacionado')) {
            $constraints = DB::select("
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_NAME = 'Notificacoes'
                AND COLUMN_NAME = 'id_desafio_relacionado'
                AND REFERENCED_TABLE_NAME = 'Desafio'
            ");

            if (empty($constraints)) {
                DB::statement("
                    ALTER TABLE Notificacoes
                    ADD CONSTRAINT notificacoes_id_desafio_relacionado_foreign
                    FOREIGN KEY (id_desafio_relacionado) REFERENCES Desafio(id)
                    ON DELETE SET NULL
                ");
            }
        }
    }

    public function down(): void
    {
        try {
            DB::statement("ALTER TABLE Regras_XP_Desafio DROP FOREIGN KEY regras_xp_desafio_id_desafio_foreign");
        } catch (\Exception $e) {}

        try {
            DB::statement("ALTER TABLE Inventario_Badges DROP FOREIGN KEY inventario_badges_id_desafio_origem_foreign");
        } catch (\Exception $e) {}

        try {
            DB::statement("ALTER TABLE Notificacoes DROP FOREIGN KEY notificacoes_id_desafio_relacionado_foreign");
        } catch (\Exception $e) {}
    }
};
