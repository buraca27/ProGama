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

        $tiposPermitidos = ['Novo_Desafio', 'Desafio_Corrigido', 'Teste_Corrigido', 'XP_Recebido', 'Novo_Nivel', 'Badge_Ganho', 'Submissao_Aluno', 'Alerta_Integridade', 'Alteracao_Datas'];
        // Prazo_Proximo é visual (não existe na BD) — ignorar se for enviado como filtro
        $tipo  = in_array($request->query('tipo'), $tiposPermitidos, true) ? $request->query('tipo') : null;
        $ordem = $request->query('ordem') === 'asc' ? 'asc' : 'desc';

        $query = Notificacao::where('id_utilizador', $user->id);

        if ($tipo !== null) {
            $query->where('tipo_notificacao', $tipo);
        }

        $notificacoes = $query
            ->orderBy('created_at', $ordem)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Notificacoes/NotificacoesIndex', [
            'notificacoes' => $notificacoes,
            'filtros'      => ['tipo' => $tipo, 'ordem' => $ordem],
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
