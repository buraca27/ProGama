<?php

namespace App\Http\Controllers;

use App\Models\OpcaoPergunta;
use App\Models\Pergunta;
use App\Models\TesteAtribuicao;
use App\Models\Teste;
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

        $pergunta = Pergunta::where('id', $id)
            ->where('id_formador_criador', (int) Auth::id())
            ->firstOrFail();

        DB::transaction(function () use ($pergunta, $validated) {
            $pergunta->update([
                'texto' => $validated['texto'],
                'tipo_pergunta' => $validated['tipo_pergunta'],
                'id_categoria' => $validated['id_categoria'],
                'url_anexo_pergunta' => $validated['url_anexo_pergunta'] ?? null,
            ]);

            OpcaoPergunta::where('id_pergunta', $pergunta->id)->delete();
            $this->sincronizarOpcoesPergunta($pergunta, $validated);
        });

        return redirect()->route('dashboard')->with('success', 'Pergunta atualizada com sucesso.');
    }

    public function storeTeste(Request $request)
    {
        $this->assertProfessor();

        $validated = $request->validate([
            'titulo' => 'required|string|max:150',
            'tipo_avaliacao' => 'required|string|in:Teste_Formal,Ficha_Trabalho,Exame_Final',
            'data_hora_abertura' => 'required|date',
            'data_hora_fecho' => 'required|date|after:data_hora_abertura',
            'duracao_minutos' => 'nullable|integer|min:1|max:600',
            'pergunta_ids' => 'nullable|array',
            'pergunta_ids.*' => 'integer|exists:Perguntas,id',
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

        DB::transaction(function () use ($validated) {
            $teste = Teste::create([
                'titulo' => $validated['titulo'],
                'tipo_avaliacao' => $validated['tipo_avaliacao'],
                'id_formador' => (int) Auth::id(),
                'data_hora_abertura' => $validated['data_hora_abertura'],
                'data_hora_fecho' => $validated['data_hora_fecho'],
                'duracao_minutos' => $validated['duracao_minutos'] ?? null,
                'peso_avaliacao' => 0,
            ]);

            $idsPerguntas = collect($validated['pergunta_ids'] ?? [])->map(fn ($id) => (int) $id)->unique()->values()->all();

            $pontuacoesBase = $this->normalizarPontuacoesPerguntas(
                $validated['pontuacao_por_pergunta'] ?? [],
                $idsPerguntas,
            );

            $pontuacoesNovasPerguntas = [];
            foreach ($validated['novas_perguntas'] ?? [] as $novaPergunta) {
                $pergunta = $this->criarPerguntaComOpcoes($novaPergunta, (int) Auth::id());
                $idsPerguntas[] = $pergunta->id;
                $pontuacoesNovasPerguntas[$pergunta->id] = (int) ($novaPergunta['pontuacao'] ?? 1);
            }

            // Preserva as chaves numéricas (IDs das perguntas).
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

            if (!empty($syncData)) {
                $teste->perguntas()->sync($syncData);
            }
        });

        return redirect()->route('dashboard')->with('success', 'Teste criado com sucesso.');
    }

    public function updateTeste(Request $request, int $id)
    {
        $this->assertProfessor();

        $validated = $request->validate([
            'titulo' => 'required|string|max:150',
            'tipo_avaliacao' => 'required|string|in:Teste_Formal,Ficha_Trabalho,Exame_Final',
            'data_hora_abertura' => 'required|date',
            'data_hora_fecho' => 'required|date|after:data_hora_abertura',
            'duracao_minutos' => 'nullable|integer|min:1|max:600',
            'pergunta_ids' => 'nullable|array',
            'pergunta_ids.*' => 'integer|exists:Perguntas,id',
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

        $teste = Teste::where('id', $id)
            ->where('id_formador', (int) Auth::id())
            ->firstOrFail();

        DB::transaction(function () use ($teste, $validated) {
            $teste->update([
                'titulo' => $validated['titulo'],
                'tipo_avaliacao' => $validated['tipo_avaliacao'],
                'data_hora_abertura' => $validated['data_hora_abertura'],
                'data_hora_fecho' => $validated['data_hora_fecho'],
                'duracao_minutos' => $validated['duracao_minutos'] ?? null,
            ]);

            $idsPerguntas = collect($validated['pergunta_ids'] ?? [])->map(fn ($item) => (int) $item)->unique()->values()->all();

            $pontuacoesBase = $this->normalizarPontuacoesPerguntas(
                $validated['pontuacao_por_pergunta'] ?? [],
                $idsPerguntas,
            );

            $pontuacoesNovasPerguntas = [];
            foreach ($validated['novas_perguntas'] ?? [] as $novaPergunta) {
                $pergunta = $this->criarPerguntaComOpcoes($novaPergunta, (int) Auth::id());
                $idsPerguntas[] = $pergunta->id;
                $pontuacoesNovasPerguntas[$pergunta->id] = (int) ($novaPergunta['pontuacao'] ?? 1);
            }

            // Preserva as chaves numéricas (IDs das perguntas).
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
        });

        return redirect()->route('dashboard')->with('success', 'Teste atualizado com sucesso.');
    }

    public function storeTarefa(Request $request)
    {
        $this->assertProfessor();

        $validated = $request->validate([
            'id_teste' => 'required|integer|exists:Testes,id',
            'turma_ids' => 'required|array|min:1',
            'turma_ids.*' => 'integer|exists:Turmas,id',
        ]);

        $professorId = (int) Auth::id();

        $teste = Teste::where('id', $validated['id_teste'])
            ->where('id_formador', $professorId)
            ->firstOrFail();

        $turmasPermitidas = User::findOrFail($professorId)
            ->turmasLecionadas()
            ->pluck('Turmas.id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $turmasSelecionadas = collect($validated['turma_ids'])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $turmasInvalidas = $turmasSelecionadas->filter(
            fn ($id) => !in_array($id, $turmasPermitidas, true)
        );

        if ($turmasInvalidas->isNotEmpty()) {
            throw ValidationException::withMessages([
                'turma_ids' => 'Existem turmas selecionadas que não estão associadas ao professor.',
            ]);
        }

        DB::transaction(function () use ($teste, $turmasSelecionadas) {
            foreach ($turmasSelecionadas as $turmaId) {
                TesteAtribuicao::firstOrCreate([
                    'id_teste' => $teste->id,
                    'id_turma' => $turmaId,
                    'id_grupo' => null,
                    'id_aluno' => null,
                ]);
            }
        });

        return redirect()->route('dashboard')->with('success', 'Tarefa atribuida com sucesso.');
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
            $opcoes = collect($dados['opcoes'] ?? [])->filter(fn ($opt) => filled($opt))->values();

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

    private function normalizarPontuacoesPerguntas(array $pontuacoesRecebidas, array $idsPerguntas): array
    {
        $pontuacoes = collect($pontuacoesRecebidas)
            ->mapWithKeys(fn ($pontuacao, $idPergunta) => [(int) $idPergunta => (int) $pontuacao])
            ->all();

        $idsPerguntas = array_values(array_map(fn ($id) => (int) $id, $idsPerguntas));
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

    private function assertProfessor(): void
    {
        if (Auth::user()?->id_role !== 2) {
            abort(403);
        }
    }
}
