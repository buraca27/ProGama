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
        $utilizador = $request->user();

        $notificacoes = Notificacao::query()
            ->where('id_utilizador', (int) $utilizador->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Notificacoes/Index', [
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
