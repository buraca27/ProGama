<?php

namespace App\Http\Controllers;

use App\Models\Desafio;
use App\Models\AtribuicaoDesafio;
use App\Models\SubmissaoDesafioAluno;
use App\Models\RespostaDesafioAluno;
use App\Services\GamificationService;
use App\Services\NotificacaoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DesafioAlunoController extends Controller
{
    protected GamificationService $gamificationService;
    protected NotificacaoService $notificacaoService;

    public function __construct(GamificationService $gamificationService, NotificacaoService $notificacaoService)
    {
        $this->gamificationService = $gamificationService;
        $this->notificacaoService = $notificacaoService;
    }

    public function index(Request $request)
    {
        $usuario = $request->user();
        $filtro = $request->query('filtro', 'todos');

        $query = Desafio::whereHas('atribuicoes', function ($q) use ($usuario) {
            $q->where('id_aluno', $usuario->id);
        });

        if ($filtro === 'quiz') {
            $query->where('tipo_desafio', 'Quiz');
        } elseif ($filtro === 'tarefa') {
            $query->where('tipo_desafio', 'Tarefa');
        } elseif ($filtro === 'ativos') {
            $query->where('ativa', true)
                  ->where('data_inicio', '<=', now())
                  ->where('data_fim', '>=', now());
        } elseif ($filtro === 'concluidos') {
            $query->whereHas('submissoes', function ($q) use ($usuario) {
                $q->where('id_aluno', $usuario->id)
                  ->where('estado', SubmissaoDesafioAluno::CONCLUIDO);
            });
        }

        $desafios = $query->with(['atribuicoes' => function ($q) use ($usuario) {
            $q->where('id_aluno', $usuario->id);
        }])->paginate(12);

        $desafios->each(function ($desafio) use ($usuario) {
            $submissaoRecente = $desafio->submissoes()
                ->where('id_aluno', $usuario->id)
                ->latest()
                ->first();

            $desafio->status_usuario = $submissaoRecente?->estado ?? SubmissaoDesafioAluno::PENDENTE;
            $desafio->nota_obtida = $submissaoRecente?->nota;
        });

        return Inertia::render('Desafios/Aluno/Index', [
            'desafios' => $desafios,
            'filtro_atual' => $filtro,
            'xp_usuario' => $usuario->getXpTotal(),
            'nivel_usuario' => $usuario->getNivelAtual(),
        ]);
    }

    private function findAtribuicao(Desafio $desafio, $usuario): ?AtribuicaoDesafio
    {
        $idTurma = $usuario->id_turma ? (int) $usuario->id_turma : null;

        return AtribuicaoDesafio::where('id_desafio', $desafio->id)
            ->where(function ($q) use ($usuario, $idTurma) {
                $q->where('id_aluno', $usuario->id)
                    ->orWhere(function ($or) use ($idTurma) {
                        $or->whereNull('id_aluno');
                        if ($idTurma) {
                            $or->where('id_turma', $idTurma);
                        } else {
                            $or->whereRaw('1 = 0');
                        }
                    });
            })
            ->first();
    }

    public function show(Desafio $desafio, Request $request)
    {
        $usuario = $request->user();

        $atribuicao = $this->findAtribuicao($desafio, $usuario);

        if (!$atribuicao) {
            abort(403, 'Desafio não atribuído a este utilizador');
        }

        if ($desafio->isQuiz()) {
            return $this->showQuiz($desafio, $usuario, $atribuicao);
        } else {
            return $this->showTarefa($desafio, $usuario, $atribuicao);
        }
    }

    private function showQuiz(Desafio $desafio, $usuario, AtribuicaoDesafio $atribuicao)
    {
        $perguntas = $desafio->perguntas()
            ->with('opcoes')
            ->get();

        $submissaoAtiva = $desafio->submissoes()
            ->where('id_aluno', $usuario->id)
            ->where('estado', SubmissaoDesafioAluno::EM_RESOLUCAO)
            ->first();

        return Inertia::render('Desafios/Quiz/Show', [
            'desafio' => $desafio,
            'perguntas' => $perguntas,
            'atribuicao' => $atribuicao,
            'tentativas_restantes' => $atribuicao->tentativasRestantes((int) $usuario->id),
            'submissao_ativa' => $submissaoAtiva,
        ]);
    }

    private function showTarefa(Desafio $desafio, $usuario, AtribuicaoDesafio $atribuicao)
    {
        $submissaoRecente = $desafio->submissoes()
            ->where('id_aluno', $usuario->id)
            ->latest()
            ->first();

        return Inertia::render('Desafios/Tarefa/Show', [
            'desafio' => $desafio,
            'atribuicao' => $atribuicao,
            'tentativas_restantes' => $atribuicao->tentativasRestantes((int) $usuario->id),
            'submissao_recente' => $submissaoRecente,
            'anexos_professor' => collect($desafio->anexos_professor_json ?? [])
                ->filter(fn($anexo) => is_array($anexo) && !empty($anexo['caminho']))
                ->map(fn($anexo) => [
                    'nome' => $anexo['nome'] ?? basename((string) $anexo['caminho']),
                    'url' => '/storage/' . $anexo['caminho'],
                ])
                ->values()
                ->all(),
            'anexo_global_url' => $desafio->descricao_ficheiro
                ? '/storage/' . $desafio->descricao_ficheiro
                : null,
        ]);
    }

    public function iniciarQuiz(Desafio $desafio, Request $request)
    {
        $usuario = $request->user();

        $atribuicao = $this->findAtribuicao($desafio, $usuario);

        if (!$atribuicao instanceof AtribuicaoDesafio) {
            return $request->expectsJson()
                ? response()->json(['erro' => 'Desafio não atribuído'], 403)
                : back()->with('error', 'Desafio nao atribuido.');
        }

        if (!$atribuicao->temTentativasDisponiveis((int) $usuario->id)) {
            return $request->expectsJson()
                ? response()->json(['erro' => 'Sem tentativas disponíveis'], 403)
                : back()->with('error', 'Sem tentativas disponiveis.');
        }

        if (!$atribuicao->estaValida()) {
            return $request->expectsJson()
                ? response()->json(['erro' => 'Fora do período atribuído'], 403)
                : back()->with('error', 'Fora do periodo atribuido.');
        }

        $submissao = SubmissaoDesafioAluno::create([
            'id_desafio' => $desafio->id,
            'id_aluno' => $usuario->id,
            'id_atribuicao' => $atribuicao->id,
            'estado' => SubmissaoDesafioAluno::EM_RESOLUCAO,
            'numero_tentativa' => $atribuicao->submissoes()->count() + 1,
            'data_inicio_resolucao' => now(),
        ]);

        $payload = [
            'submissao_id' => $submissao->id,
            'mensagem' => 'Quiz iniciado',
        ];

        return $request->expectsJson()
            ? response()->json($payload)
            : back()->with('success', 'Quiz iniciado com sucesso.');
    }

    public function submeterQuiz(Desafio $desafio, Request $request)
    {
        $usuario = $request->user();
        $request->validate([
            'id_atribuicao' => 'required|integer',
            'respostas' => 'required|array|min:1',
        ]);

        $atribuicao = AtribuicaoDesafio::findOrFail($request->input('id_atribuicao'));

        if (!$atribuicao->temTentativasDisponiveis((int) $usuario->id)) {
            return back()->withErrors([
                'desafio' => 'Esgotaste o número máximo de tentativas para este desafio.',
            ]);
        }

        $respostas = $request->input('respostas');

        $submissao = SubmissaoDesafioAluno::create([
            'id_desafio' => $desafio->id,
            'id_aluno' => $usuario->id,
            'id_atribuicao' => $request->input('id_atribuicao'),
            'estado' => SubmissaoDesafioAluno::SUBMETIDO,
            'data_submissao' => now(),
        ]);

        foreach ($respostas as $idPergunta => $resposta) {
            RespostaDesafioAluno::create([
                'id_submissao' => $submissao->id,
                'id_pergunta' => $idPergunta,
                'ids_opcoes_escolhidas' => is_array($resposta) ? $resposta : [$resposta],
            ]);
        }

        if ($desafio->pontuacao_automatica) {
            $this->calcularNotaQuiz($submissao);
        } else {
            $submissao->update(['estado' => SubmissaoDesafioAluno::SUBMETIDO]);
        }

        if ($desafio->id_formador) {
            $this->notificacaoService->notificarSubmissaoAluno(
                (int) $desafio->id_formador,
                (int) $usuario->id,
                (string) $usuario->name,
                (int) $desafio->id,
                (string) $desafio->titulo,
                (int) $submissao->id
            );
        }

        $payload = [
            'submissao_id' => $submissao->id,
            'nota' => $submissao->nota,
            'estado' => $submissao->estado,
        ];

        return $request->expectsJson()
            ? response()->json($payload)
            : back()->with('success', 'Quiz submetido com sucesso.');
    }

    private function calcularNotaQuiz(SubmissaoDesafioAluno $submissao)
    {
        $desafio = $submissao->desafio;
        $perguntas = $desafio->perguntas()->get();
        $pontuacaoPorPergunta = $perguntas
            ->mapWithKeys(fn($p) => [$p->id => (float) ($p->pivot->valor_pontuacao ?? 0)]);

        $pontosMaximos = (float) $pontuacaoPorPergunta->sum();
        $pontosobtidos = 0.0;

        foreach ($submissao->respostas as $resposta) {
            $pergunta = $resposta->pergunta;
            $opcaoCorreta = $pergunta->opcoes()->where('correta', true)->first();
            $pontosPergunta = (float) ($pontuacaoPorPergunta[$resposta->id_pergunta] ?? 0);

            $escolhidas = $resposta->ids_opcoes_escolhidas;
            if (!is_array($escolhidas)) {
                $escolhidas = [];
            }

            if ($opcaoCorreta && in_array($opcaoCorreta->id, $escolhidas, true)) {
                $pontosobtidos += $pontosPergunta;
                $resposta->update(['correta' => true, 'pontuacao' => $pontosPergunta]);
            } else {
                $resposta->update(['correta' => false, 'pontuacao' => 0]);
            }
        }

        $nota = ($pontosMaximos > 0) ? ($pontosobtidos / $pontosMaximos) * 20 : 0;
        $estado = ($nota >= $desafio->nota_minima_passagem) ? SubmissaoDesafioAluno::CONCLUIDO : SubmissaoDesafioAluno::FALHADO;

        $submissao->update([
            'nota' => $nota,
            'estado' => $estado,
            'data_submissao' => now(),
        ]);

        if ($desafio->auto_award_xp) {
            $this->gamificationService->atribuirXpSubmissao($submissao);
            if ($nota >= ($desafio->nota_minima_passagem ?? 10)) {
                $this->gamificationService->processarBadgesAutomaticas($submissao);
            }
        }

        $this->notificacaoService->notificarDesafioCorrigido(
            (int) $submissao->id_aluno,
            (int) $desafio->id,
            (float) $nota,
        );
    }

    public function submeterTarefa(Desafio $desafio, Request $request)
    {
        $usuario = $request->user();

        $validated = $request->validate([
            'ficheiro' => 'nullable|file|max:20480',
            'link_submissao' => 'nullable|url|max:2048',
            'mensagem_submissao' => 'nullable|string|max:5000',
        ]);

        if (empty($validated['ficheiro']) && empty($validated['link_submissao'])) {
            return back()->withErrors([
                'ficheiro' => 'Deves submeter um ficheiro ou um link.',
            ]);
        }

        $atribuicao = $this->findAtribuicao($desafio, $usuario);

        if (!$atribuicao || !$atribuicao->temTentativasDisponiveis((int) $usuario->id)) {
            return $request->expectsJson()
                ? response()->json(['erro' => 'Não pode submeter'], 403)
                : back()->with('error', 'Nao pode submeter.');
        }

        $caminhoFicheiro = null;
        if (!empty($validated['ficheiro'])) {
            $caminhoFicheiro = $validated['ficheiro']->store('submissoes', 'public');
        }

        $metadata = [
            'ficheiro' => $caminhoFicheiro,
            'link_submissao' => $validated['link_submissao'] ?? null,
            'mensagem_submissao' => $validated['mensagem_submissao'] ?? null,
        ];

        $submissao = SubmissaoDesafioAluno::create([
            'id_desafio' => $desafio->id,
            'id_aluno' => $usuario->id,
            'id_atribuicao' => $atribuicao->id,
            'estado' => SubmissaoDesafioAluno::SUBMETIDO,
            'numero_tentativa' => $atribuicao->submissoes()->count() + 1,
            'data_submissao' => now(),
            'metadata' => $metadata,
        ]);

        if ($desafio->id_formador) {
            $this->notificacaoService->notificarSubmissaoAluno(
                (int) $desafio->id_formador,
                (int) $usuario->id,
                (string) $usuario->name,
                (int) $desafio->id,
                (string) $desafio->titulo,
                (int) $submissao->id
            );
        }

        $payload = [
            'submissao_id' => $submissao->id,
            'mensagem' => 'Tarefa submetida com sucesso',
        ];

        return $request->expectsJson()
            ? response()->json($payload)
            : back()->with('success', 'Tarefa submetida com sucesso.');
    }

    public function historicoSubmissoes(Desafio $desafio, Request $request)
    {
        $usuario = $request->user();

        $submissoes = $desafio->submissoes()
            ->where('id_aluno', $usuario->id)
            ->with('respostas')
            ->orderBy('numero_tentativa')
            ->get();

        return response()->json([
            'submissoes' => $submissoes,
        ]);
    }
}
