<?php

namespace App\Services;

use App\Models\Desafio;
use App\Models\User;
use App\Models\UserXp;
use App\Models\Level;
use App\Models\Badge;
use App\Models\SubmissaoDesafioAluno;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class GamificationService
{
    public function atribuirXpSubmissao(SubmissaoDesafioAluno $submissao): int
    {
        if (!$submissao->desafio->auto_award_xp || !$submissao->nota) {
            return 0;
        }

        $xpGanho = $submissao->desafio->calcularXpParaNota($submissao->nota);

        if ($xpGanho > 0) {
            $this->atribuirXpUsuario($submissao->id_aluno, $xpGanho);

            $this->criarRegistoHistorico($submissao->id_aluno, 'xp_ganho', [
                'xp' => $xpGanho,
                'id_desafio' => $submissao->id_desafio,
                'nota' => $submissao->nota,
            ]);
        }

        return $xpGanho;
    }

    public function atribuirXpUsuario(int $idUsuario, int $xpGanho): void
    {
        $role = DB::table('users')->where('id', $idUsuario)->value('id_role');
        if ((int) $role !== 3) return; // apenas alunos ganham XP

        $userXp = UserXp::firstOrCreate(
            ['id_usuario' => $idUsuario],
            [
                'xp_total' => 0,
                'nivel_atual' => 1,
                'xp_proximo_nivel' => Level::where('nivel', 2)->value('xp_requerido') ?? 1,
                'ultima_atualizacao' => now(),
            ]
        );

        $userXp->adicionarXp($xpGanho);
    }

    public function atribuirBadgeUsuario(User $usuario, Badge $badge, ?int $idDesafioOrigem = null): bool
    {
        if ((int) $usuario->id_role !== 3) return false; // apenas alunos ganham badges

        if ($usuario->badges()->where('id_badge', $badge->id)->exists()) {
            return false;
        }

        $usuario->badges()->attach($badge->id, [
            'id_desafio_origem' => $idDesafioOrigem,
            'data_obtencao' => now(),
        ]);

        $this->criarRegistoHistorico($usuario->id, 'badge_conquistada', [
            'id_badge' => $badge->id,
            'nome_badge' => $badge->nome,
            'raridade' => $badge->raridade,
            'id_desafio' => $idDesafioOrigem,
        ]);

        return true;
    }

    public function processarBadgesAutomaticas(SubmissaoDesafioAluno $submissao): void
    {
        $desafio = $submissao->desafio;
        $badgeIds = $desafio->getBadgeIds();

        if (empty($badgeIds)) {
            return;
        }

        $usuario = $submissao->aluno;

        foreach ($badgeIds as $badgeId) {
            $badge = Badge::find($badgeId);
            if ($badge && $badge->ativa) {
                $this->atribuirBadgeUsuario($usuario, $badge, $desafio->id);
            }
        }
    }

    public function verificarSubidaNivel(int $idUsuario): ?int
    {
        $userXp = UserXp::where('id_usuario', $idUsuario)->first();
        if (!$userXp) {
            return null;
        }

        $nivelAnterior = $userXp->nivel_atual;
        $novoNivel = Level::getNivelPorXp($userXp->xp_total);

        if (!$novoNivel || $novoNivel->nivel === $nivelAnterior) {
            return null;
        }

        $userXp->nivel_atual = $novoNivel->nivel;
        $userXp->save();

        $this->criarRegistoHistorico($idUsuario, 'nivel_subido', [
            'nivel_anterior' => $nivelAnterior,
            'nivel_novo' => $novoNivel->nivel,
            'nome_nivel' => $novoNivel->nome_nivel,
        ]);

        return $novoNivel->nivel;
    }

    public function getPosicaoRanking(int $idUsuario): int
    {
        return UserXp::where('xp_total', '>',
            UserXp::where('id_usuario', $idUsuario)->value('xp_total') ?? 0
        )->count() + 1;
    }

    public function getTopXp(int $limite = 10)
    {
        return DB::table('users as u')
            ->leftJoin('User_XP as ux', 'u.id', '=', 'ux.id_usuario')
            ->where('u.id_role', 3)
            ->select(
                'u.id',
                'u.name',
                'u.foto_perfil',
                DB::raw('COALESCE(ux.xp_total, 0) as xp_total'),
                DB::raw('COALESCE(ux.nivel_atual, 1) as nivel_atual')
            )
            ->orderByDesc('xp_total')
            ->limit($limite)
            ->get();
    }

    public function getTopBadges(int $limite = 10)
    {
        $colunaUtilizadorInventario = $this->colunaUtilizadorInventarioBadges();

        return DB::table('users as u')
            ->leftJoin('Inventario_Badges as ib', 'u.id', '=', 'ib.' . $colunaUtilizadorInventario)
            ->where('u.id_role', 3)
            ->select('u.id', 'u.name', DB::raw('COUNT(DISTINCT ib.id_badge) as total_badges'))
            ->groupBy('u.id', 'u.name')
            ->orderByDesc('total_badges')
            ->limit($limite)
            ->get();
    }

    public function getTopBadgesPontuacao(int $limite = 10)
    {
        $colunaUtilizadorInventario = $this->colunaUtilizadorInventarioBadges();

        return DB::table('users as u')
            ->leftJoin('Inventario_Badges as ib', 'u.id', '=', 'ib.' . $colunaUtilizadorInventario)
            ->leftJoin('Badges as b', 'ib.id_badge', '=', 'b.id')
            ->leftJoin('User_XP as ux', 'u.id', '=', 'ux.id_usuario')
            ->where('u.id_role', 3)
            ->select(
                'u.id',
                'u.name',
                'u.foto_perfil',
                DB::raw('COALESCE(ux.nivel_atual, 1) as nivel_atual'),
                DB::raw('COUNT(DISTINCT ib.id_badge) as total_badges'),
                DB::raw("COALESCE(SUM(
                    CASE
                        WHEN b.raridade = 4 THEN 20
                        WHEN b.raridade = 3 THEN 10
                        WHEN b.raridade = 2 THEN 5
                        WHEN b.raridade = 1 THEN 3
                        ELSE 1
                    END
                ), 0) as badge_score")
            )
            ->groupBy('u.id', 'u.name', 'u.foto_perfil', 'ux.nivel_atual')
            ->orderByDesc('badge_score')
            ->orderByDesc('total_badges')
            ->limit($limite)
            ->get();
    }

    private function colunaUtilizadorInventarioBadges(): string
    {
        if (Schema::hasColumn('Inventario_Badges', 'id_usuario')) {
            return 'id_usuario';
        }

        if (Schema::hasColumn('Inventario_Badges', 'id_utilizador')) {
            return 'id_utilizador';
        }

        return 'id_usuario';
    }

    public function getTopNivel(int $limite = 10)
    {
        return DB::table('users as u')
            ->leftJoin('User_XP as ux', 'u.id', '=', 'ux.id_usuario')
            ->where('u.id_role', 3)
            ->select(
                'u.id',
                'u.name',
                'u.foto_perfil',
                DB::raw('COALESCE(ux.xp_total, 0) as xp_total'),
                DB::raw('COALESCE(ux.nivel_atual, 1) as nivel_atual')
            )
            ->orderByDesc('nivel_atual')
            ->orderByDesc('xp_total')
            ->limit($limite)
            ->get();
    }

    private function criarRegistoHistorico(int $idUsuario, string $tipo, array $dados): void
    {
        try {
            DB::table('Historico_Atividades')->insert([
                'id_aluno' => $idUsuario,
                'descricao' => json_encode($dados),
                'xp_ganho' => $dados['xp'] ?? 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            logger()->error('Erro ao criar histórico de atividade', [
                'id_usuario' => $idUsuario,
                'tipo' => $tipo,
                'erro' => $e->getMessage(),
            ]);
        }
    }

    public function resetarXp(int $idUsuario): void
    {
        UserXp::where('id_usuario', $idUsuario)->updateOrCreate(
            ['id_usuario' => $idUsuario],
            [
                'xp_total' => 0,
                'nivel_atual' => 1,
                'xp_proximo_nivel' => Level::where('nivel', 2)->value('xp_requerido') ?? 1,
                'ultima_atualizacao' => now(),
            ]
        );

        $this->criarRegistoHistorico($idUsuario, 'xp_resetado', []);
    }
}
