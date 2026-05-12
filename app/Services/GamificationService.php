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
    /**
     * Atribui XP a um utilizador baseado na submissão de um desafio
     *
     * @param SubmissaoDesafioAluno $submissao
     * @return int O XP atribuído
     */
    public function atribuirXpSubmissao(SubmissaoDesafioAluno $submissao): int
    {
        if (!$submissao->desafio->auto_award_xp || !$submissao->nota) {
            return 0;
        }

        // Calcular XP baseado na regra
        $xpGanho = $submissao->desafio->calcularXpParaNota($submissao->nota);

        if ($xpGanho > 0) {
            $this->atribuirXpUsuario($submissao->id_aluno, $xpGanho);

            // Log no histórico
            $this->criarRegistoHistorico($submissao->id_aluno, 'xp_ganho', [
                'xp' => $xpGanho,
                'id_desafio' => $submissao->id_desafio,
                'nota' => $submissao->nota,
            ]);
        }

        return $xpGanho;
    }

    /**
     * Atribui XP diretamente a um utilizador
     *
     * @param int $idUsuario
     * @param int $xpGanho
     */
    public function atribuirXpUsuario(int $idUsuario, int $xpGanho): void
    {
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

    /**
     * Atribui uma badge a um utilizador
     *
     * @param User $usuario
     * @param Badge $badge
     * @param int|null $idDesafioOrigem
     * @return bool
     */
    public function atribuirBadgeUsuario(User $usuario, Badge $badge, ?int $idDesafioOrigem = null): bool
    {
        // Verificar se já tem a badge
        if ($usuario->badges()->where('id_badge', $badge->id)->exists()) {
            return false; // Badge já conquistada
        }

        // Adicionar badge ao inventário
        $usuario->badges()->attach($badge->id, [
            'id_desafio_origem' => $idDesafioOrigem,
            'data_aquisicao' => now(),
        ]);

        // Log no histórico
        $this->criarRegistoHistorico($usuario->id, 'badge_conquistada', [
            'id_badge' => $badge->id,
            'nome_badge' => $badge->nome,
            'raridade' => $badge->raridade,
            'id_desafio' => $idDesafioOrigem,
        ]);

        return true;
    }

    /**
     * Processa badges automáticas para uma submissão
     *
     * @param SubmissaoDesafioAluno $submissao
     */
    public function processarBadgesAutomaticas(SubmissaoDesafioAluno $submissao): void
    {
        $desafio = $submissao->desafio;

        if (!$desafio->badges_json || !is_array($desafio->badges_json)) {
            return;
        }

        $usuario = $submissao->aluno;
        $badgeIds = $desafio->badges_json;

        foreach ($badgeIds as $badgeId) {
            $badge = Badge::find($badgeId);
            if ($badge && $badge->ativa) {
                $this->atribuirBadgeUsuario($usuario, $badge, $desafio->id);
            }
        }
    }

    /**
     * Verifica se um utilizador subiu de nível
     *
     * @param int $idUsuario
     * @return int|null O novo nível, ou null se não houve alteração
     */
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

        // Atualizar nível
        $userXp->nivel_atual = $novoNivel->nivel;
        $userXp->save();

        // Log no histórico
        $this->criarRegistoHistorico($idUsuario, 'nivel_subido', [
            'nivel_anterior' => $nivelAnterior,
            'nivel_novo' => $novoNivel->nivel,
            'nome_nivel' => $novoNivel->nome_nivel,
        ]);

        return $novoNivel->nivel;
    }

    /**
     * Obtém a posição de um utilizador no ranking de XP
     *
     * @param int $idUsuario
     * @return int A posição no ranking (1-indexed)
     */
    public function getPosicaoRanking(int $idUsuario): int
    {
        return UserXp::where('xp_total', '>',
            UserXp::where('id_usuario', $idUsuario)->value('xp_total') ?? 0
        )->count() + 1;
    }

    /**
     * Obtém o top N utilizadores por XP
     *
     * @param int $limite
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getTopXp(int $limite = 10)
    {
        return UserXp::with('usuario')
            ->orderByDesc('xp_total')
            ->limit($limite)
            ->get();
    }

    /**
     * Obtém o top N utilizadores por badges
     *
     * @param int $limite
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getTopBadges(int $limite = 10)
    {
        $colunaUtilizadorInventario = $this->colunaUtilizadorInventarioBadges();

        return DB::table('users as u')
            ->leftJoin('Inventario_Badges as ib', 'u.id', '=', 'ib.' . $colunaUtilizadorInventario)
            ->select('u.id', 'u.name', DB::raw('COUNT(DISTINCT ib.id_badge) as total_badges'))
            ->groupBy('u.id', 'u.name')
            ->orderByDesc('total_badges')
            ->limit($limite)
            ->get();
    }

    /**
     * Ranking de badges por pontuacao ponderada.
     * Ouro/Gold=10, Silver/Prata=5, Bronze=3, outros=1
     */
    public function getTopBadgesPontuacao(int $limite = 10)
    {
        $colunaUtilizadorInventario = $this->colunaUtilizadorInventarioBadges();

        return DB::table('users as u')
            ->leftJoin('Inventario_Badges as ib', 'u.id', '=', 'ib.' . $colunaUtilizadorInventario)
            ->leftJoin('Badges as b', 'ib.id_badge', '=', 'b.id')
            ->select(
                'u.id',
                'u.name',
                DB::raw('COUNT(DISTINCT ib.id_badge) as total_badges'),
                DB::raw("COALESCE(SUM(
                    CASE
                        WHEN LOWER(COALESCE(b.raridade, b.nome, '')) LIKE '%ouro%' OR LOWER(COALESCE(b.raridade, b.nome, '')) LIKE '%gold%' THEN 10
                        WHEN LOWER(COALESCE(b.raridade, b.nome, '')) LIKE '%silver%' OR LOWER(COALESCE(b.raridade, b.nome, '')) LIKE '%prata%' THEN 5
                        WHEN LOWER(COALESCE(b.raridade, b.nome, '')) LIKE '%bronze%' THEN 3
                        ELSE 1
                    END
                ), 0) as badge_score")
            )
            ->groupBy('u.id', 'u.name')
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

        // Fallback conservador para ambientes antigos
        return 'id_usuario';
    }

    public function getTopNivel(int $limite = 10)
    {
        return UserXp::with('usuario')
            ->orderByDesc('nivel_atual')
            ->orderByDesc('xp_total')
            ->limit($limite)
            ->get();
    }

    /**
     * Cria um registo no histórico de atividades
     *
     * @param int $idUsuario
     * @param string $tipo
     * @param array $dados
     */
    private function criarRegistoHistorico(int $idUsuario, string $tipo, array $dados): void
    {
        try {
            DB::table('HistoricoAtividades')->insert([
                'id_aluno' => $idUsuario,
                'tipo_atividade' => $tipo,
                'referencia_type' => null,
                'referencia_id' => null,
                'descricao' => json_encode($dados),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Log de erro silencioso
            logger()->error('Erro ao criar histórico de atividade', [
                'id_usuario' => $idUsuario,
                'tipo' => $tipo,
                'erro' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Reseta o XP de um utilizador (para fins administrativos)
     *
     * @param int $idUsuario
     */
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
