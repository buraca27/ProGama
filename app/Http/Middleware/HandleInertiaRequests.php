<?php

namespace App\Http\Middleware;

use App\Services\NotificacaoService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $roleMap = [1 => 'admin', 2 => 'professor', 3 => 'aluno'];
        $userRoleReal = $user ? ($roleMap[$user->id_role] ?? 'aluno') : null;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user
                    ? array_merge($user->toArray(), [
                        'xp_total' => $user->getXpTotal(),
                        'nivel_atual' => $user->getNivelAtual(),
                        'percentagem_nivel' => $user->getPercentagemNivel(),
                        'xp_proximo_nivel' => $user->getXpProximoNivel(),
                        'badges_count' => $user->getContagemBadges(),
                        'badges_bronze_count' => $user->getBadgesPorRaridade(1),
                        'badges_prata_count' => $user->getBadgesPorRaridade(2),
                        'badges_ouro_count' => $user->getBadgesPorRaridade(3),
                        'badges_lendaria_count' => $user->getBadgesPorRaridade(4),
                        'seguidores_count' => $user->seguidores()->count(),
                        'seguindo_count' => $user->seguindo()->count(),
                        'conexoes_count' => $user->seguindo()
                            ->whereIn('users.id', $user->seguidores()->pluck('users.id'))
                            ->count(),
                    ])
                    : null,
            ],
            'userRoleReal' => $userRoleReal,
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'warning' => fn() => $request->session()->get('warning'),
            ],
            'notifications' => [
                'unread_count' => fn() => $user
                    ? app(NotificacaoService::class)->totalNaoLidas((int) $user->id)
                    : 0,
                'items' => fn() => $user
                    ? app(NotificacaoService::class)->recentesParaUtilizador((int) $user->id, 8)
                    : [],
            ],
            'prazo_alertas' => fn() => $user && (int) $user->id_role === 3
                ? app(NotificacaoService::class)->getPrazoAlertasParaAluno($user)
                : [],
        ];
    }
}
