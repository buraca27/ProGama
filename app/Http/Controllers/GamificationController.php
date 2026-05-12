<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserXp;
use App\Models\Level;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GamificationController extends Controller
{
    protected GamificationService $gamificationService;

    public function __construct(GamificationService $gamificationService)
    {
        $this->gamificationService = $gamificationService;
    }

    /**
     * Exibe o perfil público de um aluno com gamificação
     */
    public function perfilPublico(User $usuario)
    {
        $authUser = auth()->user();
        $userXp = $usuario->userXp ?? UserXp::where('id_usuario', $usuario->id)->first();
        $nivel = $usuario->getNivelAtual();
        $badges = $usuario->badges()->with('historicos')->paginate(12);

        return Inertia::render('Perfil/PublicoAluno', [
            'usuario' => $usuario,
            'xpTotal' => $usuario->getXpTotal(),
            'nivelAtual' => $nivel,
            'percentagemNivel' => $usuario->getPercentagemNivel(),
            'xpProxNivel' => $usuario->getXpProximoNivel(),
            'badges' => $badges,
            'contagemBadges' => $usuario->getContagemBadges(),
            'social' => [
                'seguidores' => $usuario->seguidores()->count(),
                'seguindo' => $usuario->seguindo()->count(),
                'is_self' => $authUser && $authUser->id === $usuario->id,
                'is_following' => $authUser ? $authUser->isSeguindo($usuario->id) : false,
                'is_connected' => $authUser ? $authUser->isConectadoCom($usuario->id) : false,
            ],
        ]);
    }

    /**
     * Retorna o ranking de XP (Top 10)
     */
    public function rankingXp()
    {
        $topUsuarios = $this->gamificationService->getTopXp(10);

        $ranking = $topUsuarios->map(function ($userXp, $index) {
            return [
                'posicao' => $index + 1,
                'usuario' => $userXp->usuario,
                'xp_total' => $userXp->xp_total,
                'nivel' => $userXp->nivel_atual,
                'percentagem' => $userXp->percentagemNivel(),
            ];
        });

        return Inertia::render('Gamificacao/RankingXp', [
            'ranking' => $ranking,
        ]);
    }

    /**
     * Retorna o ranking de Badges (Top 10)
     */
    public function rankingBadges()
    {
        $topUsuarios = $this->gamificationService->getTopBadgesPontuacao(10);

        $ranking = $topUsuarios->map(function ($row, $index) {
            $usuario = User::find($row->id);
            return [
                'posicao' => $index + 1,
                'usuario' => $usuario,
                'total_badges' => $row->total_badges,
                'badge_score' => $row->badge_score,
                'badges' => $usuario?->badges()->limit(5)->get(),
            ];
        });

        return Inertia::render('Gamificacao/RankingBadges', [
            'ranking' => $ranking,
        ]);
    }

    /**
     * Retorna os dados de XP do utilizador autenticado
     */
    public function meuXp(Request $request)
    {
        $usuario = $request->user();
        $userXp = $usuario->userXp ?? UserXp::where('id_usuario', $usuario->id)->first();
        $nivel = $usuario->getNivelAtual();

        return response()->json([
            'xp_total' => $usuario->getXpTotal(),
            'nivel_atual' => $nivel,
            'percentagem_nivel' => $usuario->getPercentagemNivel(),
            'xp_proximo_nivel' => $usuario->getXpProximoNivel(),
            'posicao_ranking' => $this->gamificationService->getPosicaoRanking($usuario->id),
        ]);
    }

    /**
     * Retorna os níveis disponíveis
     */
    public function niveis()
    {
        $niveis = Level::all();

        return response()->json([
            'niveis' => $niveis,
        ]);
    }

    /**
     * Exibe a página de leaderboard combinada (XP + Badges + Pódio)
     */
    public function leaderboard()
    {
        $topXp = $this->gamificationService->getTopXp(10);
        $topNivel = $this->gamificationService->getTopNivel(10);
        $topBadges = $this->gamificationService->getTopBadgesPontuacao(10);

        // Pódio (Top 3 por XP)
        $podio = $topXp->take(3)->map(function ($userXp, $index) {
            return [
                'posicao' => $index + 1,
                'usuario' => $userXp->usuario,
                'xp_total' => $userXp->xp_total,
                'nivel' => $userXp->nivel_atual,
            ];
        });

        $rankingXp = $topXp->map(function ($userXp, $index) {
            return [
                'posicao' => $index + 1,
                'usuario' => $userXp->usuario,
                'xp_total' => $userXp->xp_total,
                'nivel' => $userXp->nivel_atual,
            ];
        });

        $rankingBadges = $topBadges->map(function ($row, $index) {
            $usuario = User::find($row->id);
            return [
                'posicao' => $index + 1,
                'usuario' => $usuario,
                'total_badges' => $row->total_badges,
                'badge_score' => $row->badge_score,
            ];
        });

        $rankingNivel = $topNivel->map(function ($userXp, $index) {
            return [
                'posicao' => $index + 1,
                'usuario' => $userXp->usuario,
                'nivel' => $userXp->nivel_atual,
                'xp_total' => $userXp->xp_total,
            ];
        });

        return Inertia::render('Gamificacao/Leaderboard', [
            'podio' => $podio,
            'ranking_xp' => $rankingXp,
            'ranking_nivel' => $rankingNivel,
            'ranking_badges' => $rankingBadges,
        ]);
    }
}
