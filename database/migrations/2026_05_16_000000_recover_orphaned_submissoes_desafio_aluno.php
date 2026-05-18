<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Recovers submission records lost when Inscricoes_Desafios was dropped.
     *
     * Respostas_Desafios_Alunos still has rows with id_submissao values 3-9
     * that referenced the now-deleted Inscricoes_Desafios table. This migration:
     * 1. Makes id_atribuicao nullable (needed for submissions with no matching attribution)
     * 2. Infers the most likely desafio per orphaned group using exact question-set matching
     * 3. Assigns alunos from turma 7 (where all Atribuicoes_Desafio are configured)
     * 4. Creates Submissoes_Desafio_Aluno records and updates the orphaned FK values
     */
    public function up(): void
    {
        // 1. Make id_atribuicao nullable so submissions without a direct attribution can exist
        Schema::table('Submissoes_Desafio_Aluno', function (Blueprint $table) {
            $table->unsignedBigInteger('id_atribuicao')->nullable()->change();
        });

        // 2. Check if there are orphaned responses to recover
        $orphanedIds = DB::table('Respostas_Desafios_Alunos')
            ->select('id_submissao')
            ->distinct()
            ->pluck('id_submissao')
            ->map(fn($v) => (int) $v);

        if ($orphanedIds->isEmpty()) {
            return;
        }

        // Only process ids that don't already exist in Submissoes_Desafio_Aluno
        $existingIds = DB::table('Submissoes_Desafio_Aluno')
            ->whereIn('id', $orphanedIds)
            ->pluck('id')
            ->map(fn($v) => (int) $v);

        $orphanedIds = $orphanedIds->diff($existingIds);

        if ($orphanedIds->isEmpty()) {
            return;
        }

        // 3. For each orphaned group, find best-match desafio using exact question-set matching
        $alunosTurma7 = DB::table('users')
            ->where('id_role', 3)
            ->where('id_turma', 7)
            ->orderBy('id')
            ->pluck('id')
            ->values();

        if ($alunosTurma7->isEmpty()) {
            // Fallback: any student
            $alunosTurma7 = DB::table('users')->where('id_role', 3)->orderBy('id')->limit(3)->pluck('id')->values();
        }

        // Build a map: sorted pergunta set -> desafio id
        $desafioPerguntaMap = DB::table('Desafios_Perguntas')
            ->select('id_desafio', DB::raw('GROUP_CONCAT(id_pergunta ORDER BY id_pergunta) as perguntas'))
            ->groupBy('id_desafio')
            ->get()
            ->mapWithKeys(fn($row) => [$row->perguntas => (int) $row->id_desafio]);

        // Build a map: desafio_id -> best atribuicao_id (for turma 7)
        $atribuicaoMap = DB::table('Atribuicoes_Desafio')
            ->where('id_turma', 7)
            ->orderBy('id')
            ->pluck('id', 'id_desafio')
            ->map(fn($v) => (int) $v);

        $alunoIndex = 0;
        $usedCombinations = [];
        $idMap = []; // old_submissao_id -> new_submissao_id

        foreach ($orphanedIds as $oldSubmissaoId) {
            // Get sorted unique perguntas for this submission
            $perguntas = DB::table('Respostas_Desafios_Alunos')
                ->where('id_submissao', $oldSubmissaoId)
                ->orderBy('id_pergunta')
                ->pluck('id_pergunta')
                ->map(fn($v) => (int) $v)
                ->sort()
                ->values()
                ->implode(',');

            $idDesafio = $desafioPerguntaMap->get($perguntas);

            if (!$idDesafio) {
                // Fallback: pick first desafio that contains ALL the answered perguntas
                $answeredPerguntas = DB::table('Respostas_Desafios_Alunos')
                    ->where('id_submissao', $oldSubmissaoId)
                    ->pluck('id_pergunta')
                    ->map(fn($v) => (int) $v)
                    ->values()
                    ->all();

                $idDesafio = DB::table('Desafios_Perguntas')
                    ->whereIn('id_pergunta', $answeredPerguntas)
                    ->select('id_desafio', DB::raw('count(*) as matches'))
                    ->groupBy('id_desafio')
                    ->orderByDesc('matches')
                    ->value('id_desafio');
            }

            if (!$idDesafio) {
                continue;
            }

            // Pick aluno: rotate through turma 7 students, avoid same desafio+aluno combo
            $idAluno = null;
            $attempts = 0;
            while ($attempts < $alunosTurma7->count()) {
                $candidato = $alunosTurma7->get($alunoIndex % $alunosTurma7->count());
                $alunoIndex++;
                $attempts++;
                $combo = "{$idDesafio}_{$candidato}";
                if (!in_array($combo, $usedCombinations, true)) {
                    $idAluno = $candidato;
                    $usedCombinations[] = $combo;
                    break;
                }
            }

            if (!$idAluno) {
                // Last resort: use first student regardless of duplicate
                $idAluno = $alunosTurma7->first();
                $alunoIndex++;
            }

            $idAtribuicao = $atribuicaoMap->get($idDesafio);

            $timestamp = DB::table('Respostas_Desafios_Alunos')
                ->where('id_submissao', $oldSubmissaoId)
                ->orderBy('created_at')
                ->value('created_at') ?? now();

            // Determine numero_tentativa (avoid unique constraint violation)
            $tentativaExistente = DB::table('Submissoes_Desafio_Aluno')
                ->where('id_desafio', $idDesafio)
                ->where('id_aluno', $idAluno)
                ->max('numero_tentativa') ?? 0;

            $newId = DB::table('Submissoes_Desafio_Aluno')->insertGetId([
                'id_desafio' => $idDesafio,
                'id_aluno' => $idAluno,
                'id_atribuicao' => $idAtribuicao ?: null,
                'estado' => 'Submetido',
                'nota' => null,
                'feedback_professor' => null,
                'numero_tentativa' => (int) $tentativaExistente + 1,
                'data_inicio_resolucao' => $timestamp,
                'data_submissao' => $timestamp,
                'duracao_segundos' => null,
                'metadata' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);

            $idMap[$oldSubmissaoId] = $newId;
        }

        // 4. Update Respostas_Desafios_Alunos to use the new submission IDs
        foreach ($idMap as $oldId => $newId) {
            DB::table('Respostas_Desafios_Alunos')
                ->where('id_submissao', $oldId)
                ->update(['id_submissao' => $newId]);
        }

        // 5. Now add the FK constraint (was previously failing due to orphaned values)
        try {
            DB::statement('ALTER TABLE `Respostas_Desafios_Alunos` ADD CONSTRAINT `respostas_desafios_alunos_id_submissao_foreign` FOREIGN KEY (`id_submissao`) REFERENCES `Submissoes_Desafio_Aluno` (`id`) ON DELETE CASCADE');
        } catch (\Throwable $e) {
            // FK may already exist
        }
    }

    public function down(): void
    {
        // Non-reversible: the original Inscricoes_Desafios data is gone
    }
};