<?php

namespace App\Http\Controllers;

use App\Models\SolicitacaoConexao;
use App\Models\User;
use App\Services\NotificacaoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SocialController extends Controller
{
    protected NotificacaoService $notificacaoService;

    public function __construct(NotificacaoService $notificacaoService)
    {
        $this->notificacaoService = $notificacaoService;
    }

    public function index(Request $request)
    {
        $authUser = $request->user();

        $seguindoIds = $authUser->seguindo()->pluck('users.id')->toArray();

        $pendingSentIds = $authUser->solicitacoesEnviadas()
            ->where('estado', 'pendente')
            ->pluck('id_destinatario')
            ->toArray();

        $pendingReceivedIds = $authUser->solicitacoesRecebidas()
            ->where('estado', 'pendente')
            ->pluck('id_solicitante')
            ->toArray();

        $sugestoes = User::query()
            ->where('id', '!=', $authUser->id)
            ->whereNotIn('id', $seguindoIds)
            ->whereNotIn('id', $pendingSentIds)
            ->whereNotIn('id', $pendingReceivedIds)
            ->with('userXp')
            ->withCount(['seguidores', 'seguindo', 'badges'])
            ->orderByDesc('id')
            ->limit(20)
            ->get()
            ->map(function (User $user) use ($authUser, $pendingSentIds, $pendingReceivedIds) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'foto_perfil' => $user->foto_perfil,
                    'nivel' => $user->getNivelAtual(),
                    'xp_total' => $user->getXpTotal(),
                    'badges_count' => $user->badges_count,
                    'seguidores_count' => $user->seguidores_count,
                    'is_connected' => $authUser->isConectadoCom($user->id),
                    'request_sent' => in_array($user->id, $pendingSentIds, true),
                    'request_received' => in_array($user->id, $pendingReceivedIds, true),
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
            return back()->with('error', 'Nao pode enviar pedido para o proprio utilizador.');
        }

        if ($authUser->isSeguindo($usuario->id)) {
            return back()->with('success', 'Ja segues ' . $usuario->name . '.');
        }

        $existingRequest = SolicitacaoConexao::query()
            ->where('id_solicitante', $authUser->id)
            ->where('id_destinatario', $usuario->id)
            ->first();

        if ($existingRequest && $existingRequest->estado === 'pendente') {
            return back()->with('success', 'Pedido de conexao ja enviado para ' . $usuario->name . '.');
        }

        $reverseRequest = SolicitacaoConexao::query()
            ->where('id_solicitante', $usuario->id)
            ->where('id_destinatario', $authUser->id)
            ->where('estado', 'pendente')
            ->first();

        if ($reverseRequest) {
            return $this->aceitarPedido($usuario, $request);
        }

        SolicitacaoConexao::updateOrCreate(
            ['id_solicitante' => $authUser->id, 'id_destinatario' => $usuario->id],
            ['estado' => 'pendente']
        );

        $this->notificacaoService->criarParaUtilizador(
            $usuario->id,
            'Pedido_Conexao',
            'Recebeste um pedido de conexao de ' . $authUser->name . '.',
            null,
            $authUser->id
        );

        return back()->with('success', 'Pedido de conexao enviado a ' . $usuario->name . '.')->with('preserveState', true);
    }

    public function aceitarPedido(User $usuario, Request $request)
    {
        $authUser = $request->user();

        $solicitacao = SolicitacaoConexao::query()
            ->where('id_solicitante', $usuario->id)
            ->where('id_destinatario', $authUser->id)
            ->where('estado', 'pendente')
            ->first();

        if (!$solicitacao) {
            return back()->with('error', 'Nao existe nenhum pedido de conexao pendente desse utilizador.');
        }

        DB::transaction(function () use ($authUser, $usuario, $solicitacao) {
            // Apenas o solicitante passa a seguir o destinatário (follow assimétrico)
            $usuario->seguindo()->syncWithoutDetaching([$authUser->id]);
            $solicitacao->update(['estado' => 'aceite']);
        });

        $this->notificacaoService->criarParaUtilizador(
            $usuario->id,
            'Conexao_Aceite',
            $authUser->name . ' aceitou o teu pedido de conexao.',
            null,
            $authUser->id
        );

        return back()->with('success', 'Conexao aceite com ' . $usuario->name . '.')->with('reload_social', true);
    }

    public function recusarPedido(User $usuario, Request $request)
    {
        $authUser = $request->user();

        $solicitacao = SolicitacaoConexao::query()
            ->where('id_solicitante', $usuario->id)
            ->where('id_destinatario', $authUser->id)
            ->where('estado', 'pendente')
            ->first();

        if (!$solicitacao) {
            return back()->with('error', 'Nao existe nenhum pedido de conexao pendente desse utilizador.');
        }

        $solicitacao->update(['estado' => 'recusado']);

        $this->notificacaoService->criarParaUtilizador(
            $usuario->id,
            'Conexao_Recusada',
            $authUser->name . ' recusou o teu pedido de conexao.',
            null,
            $authUser->id
        );

        return back()->with('success', 'Pedido de conexao recusado.');
    }

    public function deixarSeguir(User $usuario, Request $request)
    {
        $authUser = $request->user();

        $authUser->seguindo()->detach($usuario->id);

        return back()->with('success', 'Deixaste de seguir ' . $usuario->name . '.');
    }

    public function removerSeguidor(User $usuario, Request $request)
    {
        $authUser = $request->user();

        // Remove o follow do seguidor em relação ao utilizador autenticado
        $usuario->seguindo()->detach($authUser->id);

        return back()->with('success', $usuario->name . ' foi removido dos teus seguidores.');
    }
}
