<?php

namespace App\Http\Controllers;

use App\Models\OpcaoPergunta;
use App\Models\Pergunta;
use App\Models\RespostaAluno;
use App\Models\TesteAtribuicao;
use App\Models\Teste;
use App\Models\TesteRealizado;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProfessorTesteController extends Controller
{
    private array $tiposPerguntaPermitidos = [
        'Escolha_Multipla',
        'Verdadeiro_Falso',
        'Dissertativa',
    ];

    public function storePergunta(Request $request)
    {
        $this->assertProfessor();

        $validated = $this->validarPergunta($request);

        DB::transaction(function () use ($validated) {
            $this->criarPerguntaComOpcoes($validated, (int) Auth::id());
        });

        return redirect()->route('dashboard')->with('success', 'Pergunta criada com sucesso.');
    }

    public function updatePergunta(Request $request, int $id)
    {
        $this->assertProfessor();

        $validated = $this->validarPergunta($request);

        $pergunta = Pergunta::where('id', '=', $id, 'and')->firstOrFail();

        DB::transaction(function () use ($pergunta, $validated) {
            $pergunta->update([
                'texto' => $validated['texto'],
                'tipo_pergunta' => $validated['tipo_pergunta'],
                'id_categoria' => $validated['id_categoria'],
                'url_anexo_pergunta' => $validated['url_anexo_pergunta'] ?? null,
            ]);

            OpcaoPergunta::where('id_pergunta', '=', $pergunta->id, 'and')->delete();
            $this->sincronizarOpcoesPergunta($pergunta, $validated);
        });

        return redirect()->route('dashboard')->with('success', 'Pergunta atualizada com sucesso.');
    }

    public function storeTeste(Request $request)
    {
        $this->assertProfessor();
        $validated = $this->validarTeste($request);

        DB::transaction(function () use ($validated) {
            $teste = Teste::create([
                'titulo' => $validated['titulo'],
                'tipo_avaliacao' => $validated['tipo_avaliacao'],
                'instrucoes' => $validated['instrucoes'] ?? null,
                'id_formador' => (int) Auth::id(),
                'peso_avaliacao' => $validated['peso_avaliacao'] ?? 0,
                'duracao_minutos' => $validated['duracao_minutos'] ?? null,
            ]);

            $this->sincronizarPerguntasTeste($teste, $validated);
        });

        return redirect()->route('dashboard')->with('success', 'Teste criado com sucesso.');
    }

    public function updateTeste(Request $request, int $id)
    {
        $this->assertProfessor();
        $validated = $this->validarTeste($request);

        $teste = Teste::where('id', '=', $id, 'and')
            ->where('id_formador', '=', (int) Auth::id(), 'and')
            ->firstOrFail();

        DB::transaction(function () use ($teste, $validated) {
            $teste->update([
                'titulo' => $validated['titulo'],
                'tipo_avaliacao' => $validated['tipo_avaliacao'],
                'instrucoes' => $validated['instrucoes'] ?? null,
                'peso_avaliacao' => $validated['peso_avaliacao'] ?? 0,
                'duracao_minutos' => $validated['duracao_minutos'] ?? null,
            ]);

            $this->sincronizarPerguntasTeste($teste, $validated);
        });

        return redirect()->route('dashboard')->with('success', 'Teste atualizado com sucesso.');
    }

    private function sincronizarPerguntasTeste(Teste $teste, array $validated): void
    {
        $idsPerguntas = collect($validated['pergunta_ids'] ?? [])->map(fn($id) => (int) $id)->unique()->values()->all();

        $pontuacoesBase = $this->normalizarPontuacoesPerguntas(
            $validated['pontuacoes_perguntas'] ?? null,
            $validated['pontuacao_por_pergunta'] ?? [],
            $idsPerguntas,
        );

        $pontuacoesNovasPerguntas = [];
        foreach ($validated['novas_perguntas'] ?? [] as $novaPergunta) {
            $pergunta = $this->criarPerguntaComOpcoes($novaPergunta, (int) Auth::id());
            $idsPerguntas[] = $pergunta->id;
            $pontuacoesNovasPerguntas[$pergunta->id] = (int) ($novaPergunta['pontuacao'] ?? 1);
        }

        $pontuacoesPorPergunta = $pontuacoesBase + $pontuacoesNovasPerguntas;
        $idsPerguntas = collect($idsPerguntas)->unique()->values();

        $syncData = [];
        foreach ($idsPerguntas as $perguntaId) {
            $syncData[$perguntaId] = [
                'valor_pontuacao' => $pontuacoesPorPergunta[$perguntaId] ?? 1
            ];
        }

        $totalPontuacao = collect($syncData)->sum('valor_pontuacao');
        if ($totalPontuacao > 20) {
            throw ValidationException::withMessages([
                'total_pontuacao' => 'A soma da pontuação das perguntas não pode ultrapassar 20. Ajusta os valores antes de guardar o teste.',
            ]);
        }

        $teste->perguntas()->sync($syncData);
    }

    private function validarTeste(Request $request): array
    {
        return $request->validate([
            'titulo' => 'required|string|max:150',
            'tipo_avaliacao' => 'required|string|in:Teste_Formal,Ficha_Trabalho,Exame_Final',
            'instrucoes' => 'nullable|string',
            'peso_avaliacao' => 'nullable|numeric|min:0|max:100',
            'duracao_minutos' => 'nullable|integer|min:1|max:600',
            'pergunta_ids' => 'nullable|array',
            'pergunta_ids.*' => 'integer|exists:Perguntas,id',
            'pontuacoes_perguntas' => 'nullable|array',
            'pontuacoes_perguntas.*.id_pergunta' => 'required|integer|exists:Perguntas,id',
            'pontuacoes_perguntas.*.valor_pontuacao' => 'nullable|integer|min:1|max:20',
            'pontuacao_por_pergunta' => 'nullable|array',
            'pontuacao_por_pergunta.*' => 'nullable|integer|min:1|max:20',
            'novas_perguntas' => 'nullable|array',
            'novas_perguntas.*.texto' => 'required|string|min:5',
            'novas_perguntas.*.tipo_pergunta' => 'required|string|in:Escolha_Multipla,Verdadeiro_Falso,Dissertativa',
            'novas_perguntas.*.id_categoria' => 'required|integer|exists:Categorias,id',
            'novas_perguntas.*.pontuacao' => 'required|integer|min:1|max:20',
            'novas_perguntas.*.url_anexo_pergunta' => 'nullable|string',
            'novas_perguntas.*.opcoes' => 'nullable|array',
            'novas_perguntas.*.opcoes.*' => 'nullable|string|max:255',
            'novas_perguntas.*.resposta_correta_index' => 'nullable|integer|min:0',
            'novas_perguntas.*.resposta_verdadeiro_falso' => 'nullable|boolean',
        ]);
    }

    public function storeTarefa(Request $request)
    {
        $this->assertProfessor();

        $validated = $request->validate([
            'id_teste' => 'required|integer|exists:Testes,id',
            'turma_ids' => 'required|array|min:1',
            'turma_ids.*' => 'integer|exists:Turmas,id',
            'data_hora_abertura' => 'required|date',
            'data_hora_fecho' => 'required|date|after:data_hora_abertura',
        ]);

        $professorId = (int) Auth::id();

        $teste = Teste::where('id', '=', $validated['id_teste'], 'and')
            ->where('id_formador', '=', $professorId, 'and')
            ->firstOrFail();

        $turmasPermitidas = User::findOrFail($professorId)
            ->turmasLecionadas()
            ->pluck('Turmas.id')
            ->map(fn($id) => (int) $id)
            ->all();

        $turmasSelecionadas = collect($validated['turma_ids'])
            ->map(fn($id) => (int) $id)
            ->unique()
            ->values();

        $turmasInvalidas = $turmasSelecionadas->filter(
            fn($id) => !in_array($id, $turmasPermitidas, true)
        );

        if ($turmasInvalidas->isNotEmpty()) {
            throw ValidationException::withMessages([
                'turma_ids' => 'Existem turmas selecionadas que não estão associadas ao professor.',
            ]);
        }

        DB::transaction(function () use ($teste, $turmasSelecionadas, $validated) {
            foreach ($turmasSelecionadas as $turmaId) {
                TesteAtribuicao::updateOrCreate([
                    'id_teste' => $teste->id,
                    'id_turma' => $turmaId,
                    'id_grupo' => null,
                    'id_aluno' => null,
                ], [
                    'data_hora_abertura' => $validated['data_hora_abertura'],
                    'data_hora_fecho' => $validated['data_hora_fecho'],
                ]);
            }
        });

        return redirect()->route('dashboard')->with('success', 'Tarefa atribuida com sucesso.');
    }

    public function updateTarefa(Request $request, int $idTarefa)
    {
        $this->assertProfessor();

        $validated = $request->validate([
            'data_hora_abertura' => 'required|date',
            'data_hora_fecho' => 'required|date|after:data_hora_abertura',
        ]);

        $tarefa = $this->obterTarefaDoProfessor($idTarefa);

        $tarefa->update([
            'data_hora_abertura' => $validated['data_hora_abertura'],
            'data_hora_fecho' => $validated['data_hora_fecho'],
        ]);

        return redirect()->route('dashboard')->with('success', 'Datas da tarefa atualizadas com sucesso.');
    }

    public function terminarTarefa(int $idTarefa)
    {
        $this->assertProfessor();

        $tarefa = $this->obterTarefaDoProfessor($idTarefa);
        $agora = now();

        $tarefa->update([
            'data_hora_fecho' => $agora,
        ]);

        return redirect()->route('dashboard')->with('success', 'Tarefa terminada com sucesso.');
    }

    public function destroyTarefa(int $idTarefa)
    {
        $this->assertProfessor();

        $tarefa = $this->obterTarefaDoProfessor($idTarefa);
        TesteAtribuicao::destroy((int) $tarefa->id);

        return redirect()->route('dashboard')->with('success', 'Tarefa eliminada com sucesso.');
    }

    public function updateCorrecao(Request $request, int $idTesteRealizado)
    {
        $this->assertProfessor();

        $validated = $request->validate([
            'publicar' => 'nullable|boolean',
            'respostas' => 'required|array|min:1',
            'respostas.*.id' => 'required|integer|exists:Respostas_Alunos,id',
            'respostas.*.status_correcao' => 'required|string|in:Correto,Errado,Por_Avaliar',
            'respostas.*.pontuacao_obtida' => 'required|integer|min:0|max:20',
            'respostas.*.comentario_formador' => 'nullable|string',
        ]);

        $testeRealizado = TesteRealizado::with(['teste.perguntas', 'respostas'])
            ->where('id', '=', $idTesteRealizado, 'and')
            ->whereHas('teste', fn($q) => $q->where('id_formador', (int) Auth::id()))
            ->firstOrFail();

        DB::transaction(function () use ($validated, $testeRealizado) {
            $respostasPayload = collect($validated['respostas'])
                ->keyBy(fn($item) => (int) $item['id']);

            $respostasBanco = RespostaAluno::whereIn('id', $respostasPayload->keys()->all(), 'and', false)
                ->where('id_teste_realizado', '=', $testeRealizado->id, 'and')
                ->get()
                ->keyBy('id');

            foreach ($respostasPayload as $idResposta => $dadosResposta) {
                /** @var RespostaAluno|null $resposta */
                $resposta = $respostasBanco->get((int) $idResposta);
                if (!$resposta) {
                    continue;
                }

                $resposta->update([
                    'status_correcao' => $dadosResposta['status_correcao'],
                    'pontuacao_obtida' => (int) $dadosResposta['pontuacao_obtida'],
                    'comentario_formador' => $dadosResposta['comentario_formador'] ?? null,
                ]);
            }

            $respostasAtualizadas = RespostaAluno::where('id_teste_realizado', '=', $testeRealizado->id, 'and')->get();
            $totalObtido = (int) $respostasAtualizadas->sum('pontuacao_obtida');

            $pontuacaoPorPergunta = $testeRealizado->teste->perguntas
                ->map(fn($pergunta) => (int) ($pergunta->pivot->valor_pontuacao ?? 1));
            $totalMaximo = (int) $pontuacaoPorPergunta->sum();

            $notaFinal = $totalMaximo > 0
                ? round(($totalObtido / $totalMaximo) * 20, 2)
                : 0;

            $temPendentes = $respostasAtualizadas
                ->contains(fn($resposta) => $resposta->status_correcao === 'Por_Avaliar');

            $publicar = (bool) ($validated['publicar'] ?? false);
            $novoEstado = $temPendentes
                ? 'Aguardando_Correcao'
                : ($publicar ? 'Corrigido' : 'Aguardando_Correcao');
            $agora = now();

            $testeRealizado->update([
                'nota_final' => $notaFinal,
                'estado' => $novoEstado,
                'corrigido_por' => (int) Auth::id(),
                'corrigido_em' => $agora,
                'publicado_em' => ($publicar && !$temPendentes) ? $agora : null,
            ]);
        });

        return redirect()->route('dashboard')->with('success', 'Correcao atualizada com sucesso.');
    }

    private function criarPerguntaComOpcoes(array $dados, int $professorId): Pergunta
    {
        if (!in_array($dados['tipo_pergunta'], $this->tiposPerguntaPermitidos, true)) {
            abort(422, 'Tipo de pergunta inválido.');
        }

        $pergunta = Pergunta::create([
            'texto' => $dados['texto'],
            'tipo_pergunta' => $dados['tipo_pergunta'],
            'id_categoria' => $dados['id_categoria'] ?? 1,
            'id_formador_criador' => $professorId,
            'url_anexo_pergunta' => $dados['url_anexo_pergunta'] ?? null,
        ]);

        $this->sincronizarOpcoesPergunta($pergunta, $dados);

        return $pergunta;
    }

    private function sincronizarOpcoesPergunta(Pergunta $pergunta, array $dados): void
    {
        if ($dados['tipo_pergunta'] === 'Escolha_Multipla') {
            $opcoes = collect($dados['opcoes'] ?? [])->filter(fn($opt) => filled($opt))->values();

            if ($opcoes->count() < 2) {
                abort(422, 'Perguntas de escolha multipla devem ter pelo menos 2 opcoes.');
            }

            $corretaIndex = (int) ($dados['resposta_correta_index'] ?? 0);
            if ($corretaIndex < 0 || $corretaIndex >= $opcoes->count()) {
                abort(422, 'Define uma opcao correta valida.');
            }

            foreach ($opcoes as $index => $textoOpcao) {
                OpcaoPergunta::create([
                    'id_pergunta' => $pergunta->id,
                    'texto_opcao' => $textoOpcao,
                    'is_correct' => $index === $corretaIndex,
                ]);
            }
        }

        if ($dados['tipo_pergunta'] === 'Verdadeiro_Falso') {
            $correta = (bool) ($dados['resposta_verdadeiro_falso'] ?? true);

            OpcaoPergunta::insert([
                [
                    'id_pergunta' => $pergunta->id,
                    'texto_opcao' => 'Verdadeiro',
                    'is_correct' => $correta,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'id_pergunta' => $pergunta->id,
                    'texto_opcao' => 'Falso',
                    'is_correct' => !$correta,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
    }

    private function normalizarPontuacoesPerguntas(?array $pontuacoesExplicitas, array $pontuacoesRecebidas, array $idsPerguntas): array
    {
        if (!empty($pontuacoesExplicitas)) {
            return collect($pontuacoesExplicitas)
                ->filter(fn($item) => is_array($item) && isset($item['id_pergunta']))
                ->mapWithKeys(fn($item) => [
                    (int) $item['id_pergunta'] => (int) ($item['valor_pontuacao'] ?? 1),
                ])
                ->all();
        }

        $pontuacoes = collect($pontuacoesRecebidas)
            ->mapWithKeys(fn($pontuacao, $idPergunta) => [(int) $idPergunta => (int) $pontuacao])
            ->all();

        $idsPerguntas = array_values(array_map(fn($id) => (int) $id, $idsPerguntas));
        $keysRecebidas = array_keys($pontuacoes);
        $keysSequenciais = $keysRecebidas === range(0, max(count($keysRecebidas) - 1, -1));

        // Alguns clientes enviam pontuações como array sequencial (0..N) em vez de mapa por ID.
        if ($keysSequenciais && count($pontuacoes) === count($idsPerguntas)) {
            $reindexado = [];
            foreach ($idsPerguntas as $index => $idPergunta) {
                $reindexado[$idPergunta] = (int) ($pontuacoes[$index] ?? 1);
            }

            return $reindexado;
        }

        return $pontuacoes;
    }

    private function validarPergunta(Request $request): array
    {
        return $request->validate([
            'texto' => 'required|string|min:5',
            'tipo_pergunta' => 'required|string|in:Escolha_Multipla,Verdadeiro_Falso,Dissertativa',
            'id_categoria' => 'required|integer|exists:Categorias,id',
            'url_anexo_pergunta' => 'nullable|string',
            'opcoes' => 'nullable|array',
            'opcoes.*' => 'nullable|string|max:255',
            'resposta_correta_index' => 'nullable|integer|min:0',
            'resposta_verdadeiro_falso' => 'nullable|boolean',
        ]);
    }

    private function obterTarefaDoProfessor(int $idTarefa): TesteAtribuicao
    {
        return TesteAtribuicao::query()
            ->where('id', '=', $idTarefa, 'and')
            ->whereHas('teste', fn($query) => $query->where('id_formador', '=', (int) Auth::id(), 'and'))
            ->firstOrFail();
    }

    private function assertProfessor(): void
    {
        if (Auth::user()?->id_role !== 2) {
            abort(403);
        }
    }
}
