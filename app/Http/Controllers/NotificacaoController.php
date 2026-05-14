<?php

namespace App\Http\Controllers;

use App\Models\Notificacao;
use App\Services\NotificacaoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificacaoController extends Controller
{
    public function __construct(private NotificacaoService $notificacaoService)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if ((int) $user->id_role === 1) {
            return redirect()->route('dashboard');
        }

        $notificacoes = Notificacao::where('id_utilizador', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Notificacoes/NotificacoesIndex', [
            'notificacoes' => $notificacoes,
        ]);
    }
    public function marcarLida(Notificacao $notificacao, Request $request)
    {
        if ((int) $notificacao->id_utilizador !== (int) $request->user()->id) {
            abort(403);
        }

        $this->notificacaoService->marcarComoLida($notificacao);

        return back()->with('success', 'Notificacao marcada como lida.');
    }

    public function marcarTodasLidas(Request $request)
    {
        $this->notificacaoService->marcarTodasComoLidas((int) $request->user()->id);

        return back()->with('success', 'Todas as notificacoes foram marcadas como lidas.');
    }
}
