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

        if ($user && (int) $user->id_role === 3) {
            app(NotificacaoService::class)->dispararLembretesPrazoParaAluno($user);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
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
        ];
    }
}
