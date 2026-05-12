<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SocialController extends Controller
{
    public function index(Request $request)
    {
        $authUser = $request->user();

        $seguindoIds = $authUser->seguindo()->pluck('users.id')->toArray();

        $sugestoes = User::query()
            ->where('id', '!=', $authUser->id)
            ->whereNotIn('id', $seguindoIds)
            ->with('userXp')
            ->withCount(['seguidores', 'seguindo', 'badges'])
            ->orderByDesc('id')
            ->limit(20)
            ->get()
            ->map(function (User $user) use ($authUser) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'foto_perfil' => $user->foto_perfil,
                    'nivel' => $user->getNivelAtual(),
                    'xp_total' => $user->getXpTotal(),
                    'badges_count' => $user->badges_count,
                    'seguidores_count' => $user->seguidores_count,
                    'is_connected' => $authUser->isConectadoCom($user->id),
                ];
            });

        $seguindo = $authUser->seguindo()
            ->with('userXp')
            ->withCount(['seguidores', 'badges'])
            ->get()
            ->map(function (User $user) use ($authUser) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'foto_perfil' => $user->foto_perfil,
                    'nivel' => $user->getNivelAtual(),
                    'xp_total' => $user->getXpTotal(),
                    'badges_count' => $user->badges_count,
                    'seguidores_count' => $user->seguidores_count,
                    'is_connected' => $authUser->isConectadoCom($user->id),
                ];
            });

        return Inertia::render('Social/Hub', [
            'sugestoes' => $sugestoes,
            'seguindo' => $seguindo,
            'social_stats' => [
                'seguidores' => $authUser->seguidores()->count(),
                'seguindo' => $authUser->seguindo()->count(),
                'conexoes' => $authUser->seguindo()
                    ->whereIn('users.id', $authUser->seguidores()->pluck('users.id'))
                    ->count(),
            ],
        ]);
    }

    public function seguir(User $usuario, Request $request)
    {
        $authUser = $request->user();

        if ($authUser->id === $usuario->id) {
            return back()->with('error', 'Nao pode seguir o proprio utilizador.');
        }

        if (!$authUser->isSeguindo($usuario->id)) {
            $authUser->seguindo()->attach($usuario->id);
        }

        return back()->with('success', 'Agora estas a seguir ' . $usuario->name . '.');
    }

    public function deixarSeguir(User $usuario, Request $request)
    {
        $authUser = $request->user();
        $authUser->seguindo()->detach($usuario->id);

        return back()->with('success', 'Deixaste de seguir ' . $usuario->name . '.');
    }
}
