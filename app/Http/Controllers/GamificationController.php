<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserXp;
use App\Services\GamificationService;
use Illuminate\Support\Facades\Auth;
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
        $authUser = Auth::user();
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
                'request_sent' => $authUser ? $authUser->hasSolicitacaoPendentePara($usuario->id) : false,
                'request_received' => $authUser ? $authUser->hasSolicitacaoPendenteDe($usuario->id) : false,
            ],
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
