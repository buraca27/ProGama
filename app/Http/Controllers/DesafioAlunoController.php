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

    /**
     * Lista os desafios atribuídos ao aluno autenticado
     */
    public function index(Request $request)
    {
        $usuario = $request->user();
        $filtro = $request->query('filtro', 'todos'); // todos, quiz, tarefa, ativos, concluidos

        $query = Desafio::whereHas('atribuicoes', function ($q) use ($usuario) {
            $q->where('id_aluno', $usuario->id);
        });

        // Aplicar filtros
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

        // Adicionar status para cada desafio
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

    /**
     * Exibe um desafio específico (Quiz ou Tarefa)
     */
    public function show(Desafio $desafio, Request $request)
    {
        $usuario = $request->user();

        // Verificar se tem atribuição
        $atribuicao = $desafio->atribuicoes()
            ->where('id_aluno', $usuario->id)
            ->first();

        if (!$atribuicao) {
            abort(403, 'Desafio não atribuído a este utilizador');
        }

        // Carregar dados apropriados conforme tipo
        if ($desafio->isQuiz()) {
            return $this->showQuiz($desafio, $usuario, $atribuicao);
        } else {
            return $this->showTarefa($desafio, $usuario, $atribuicao);
        }
    }

    /**
     * Exibe quiz específico
     */
    private function showQuiz(Desafio $desafio, $usuario, $atribuicao)
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
            'tentativas_restantes' => $atribuicao->tentativasRestantes(),
            'submissao_ativa' => $submissaoAtiva,
        ]);
    }

    /**
     * Exibe tarefa específica
     */
    private function showTarefa(Desafio $desafio, $usuario, $atribuicao)
    {
        $submissaoRecente = $desafio->submissoes()
            ->where('id_aluno', $usuario->id)
            ->latest()
            ->first();

        return Inertia::render('Desafios/Tarefa/Show', [
            'desafio' => $desafio,
            'atribuicao' => $atribuicao,
            'tentativas_restantes' => $atribuicao->tentativasRestantes(),
            'submissao_recente' => $submissaoRecente,
        ]);
    }

    /**
     * Inicia uma tentativa de quiz
     */
    public function iniciarQuiz(Desafio $desafio, Request $request)
    {
        $usuario = $request->user();

        // Verificar atribuição
        $atribuicao = $desafio->atribuicoes()
            ->where('id_aluno', $usuario->id)
            ->first();

        if (!$atribuicao) {
            return $request->expectsJson()
                ? response()->json(['erro' => 'Desafio não atribuído'], 403)
                : back()->with('error', 'Desafio nao atribuido.');
        }

        // Verificar tentativas
        if (!$atribuicao->temTentativasDisponiveis()) {
            return $request->expectsJson()
                ? response()->json(['erro' => 'Sem tentativas disponíveis'], 403)
                : back()->with('error', 'Sem tentativas disponiveis.');
        }

        // Verificar período
        if (!$atribuicao->estaValida()) {
            return $request->expectsJson()
                ? response()->json(['erro' => 'Fora do período atribuído'], 403)
                : back()->with('error', 'Fora do periodo atribuido.');
        }

        // Criar submissão
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

    /**
     * Submete as respostas do quiz
     */
    public function submeterQuiz(Desafio $desafio, Request $request)
    {
        $usuario = $request->user();
        $request->validate([
            'id_atribuicao' => 'required|integer',
            'respostas' => 'required|array|min:1',
        ]);

        $respostas = $request->input('respostas'); // Array com id_pergunta => id_opcao ou resposta_texto

        $submissao = SubmissaoDesafioAluno::create([
            'id_desafio' => $desafio->id,
            'id_aluno' => $usuario->id,
            'id_atribuicao' => $request->input('id_atribuicao'),
            'estado' => SubmissaoDesafioAluno::SUBMETIDO,
            'data_submissao' => now(),
        ]);

        // Gravar respostas individuais
        foreach ($respostas as $idPergunta => $resposta) {
            RespostaDesafioAluno::create([
                'id_submissao' => $submissao->id,
                'id_pergunta' => $idPergunta,
                'ids_opcoes_escolhidas' => is_array($resposta) ? $resposta : [$resposta],
            ]);
        }

        // Se automático, calcular nota
        if ($desafio->pontuacao_automatica) {
            $this->calcularNotaQuiz($submissao);
        } else {
            $submissao->update(['estado' => SubmissaoDesafioAluno::SUBMETIDO]);
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

    /**
     * Calcula automaticamente a nota do quiz
     */
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

        // Calcular nota em escala 0-20
        $nota = ($pontosMaximos > 0) ? ($pontosobtidos / $pontosMaximos) * 20 : 0;

        // Determinar estado
        $estado = ($nota >= $desafio->nota_minima_passagem) ? SubmissaoDesafioAluno::CONCLUIDO : SubmissaoDesafioAluno::FALHADO;

        $submissao->update([
            'nota' => $nota,
            'estado' => $estado,
            'data_submissao' => now(),
        ]);

        // Atribuir XP se configurado
        if ($desafio->auto_award_xp) {
            $this->gamificationService->atribuirXpSubmissao($submissao);
            $this->gamificationService->processarBadgesAutomaticas($submissao);
        }

        $this->notificacaoService->notificarDesafioCorrigido(
            (int) $submissao->id_aluno,
            (int) $desafio->id,
            (float) $nota,
        );
    }

    /**
     * Submete uma tarefa (ficheiro)
     */
    public function submeterTarefa(Desafio $desafio, Request $request)
    {
        $usuario = $request->user();

        $request->validate([
            'ficheiro' => 'required|file|max:10240', // 10MB
        ]);

        $atribuicao = $desafio->atribuicoes()
            ->where('id_aluno', $usuario->id)
            ->first();

        if (!$atribuicao || !$atribuicao->temTentativasDisponiveis()) {
            return $request->expectsJson()
                ? response()->json(['erro' => 'Não pode submeter'], 403)
                : back()->with('error', 'Nao pode submeter.');
        }

        // Guardar ficheiro
        $caminhoFicheiro = $request->file('ficheiro')->store('submissoes', 'public');

        // Criar submissão
        $submissao = SubmissaoDesafioAluno::create([
            'id_desafio' => $desafio->id,
            'id_aluno' => $usuario->id,
            'id_atribuicao' => $atribuicao->id,
            'estado' => SubmissaoDesafioAluno::SUBMETIDO,
            'numero_tentativa' => $atribuicao->submissoes()->count() + 1,
            'data_submissao' => now(),
        ]);

        // Gravar ficheiro na resposta (compat. com modelo antigo)
        RespostaDesafioAluno::create([
            'id_submissao' => $submissao->id,
            'resposta_texto' => $caminhoFicheiro,
        ]);

        $payload = [
            'submissao_id' => $submissao->id,
            'mensagem' => 'Tarefa submetida com sucesso',
        ];

        return $request->expectsJson()
            ? response()->json($payload)
            : back()->with('success', 'Tarefa submetida com sucesso.');
    }

    /**
     * Obtém o histórico de submissões do aluno
     */
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
