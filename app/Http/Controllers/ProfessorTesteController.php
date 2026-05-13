<?php

namespace App\Http\Controllers;

use App\Models\OpcaoPergunta;
use App\Models\AtribuicaoDesafio;
use App\Models\Badge;
use App\Models\Desafio;
use App\Models\Pergunta;
use App\Models\RespostaDesafioAluno;
use App\Models\InscricaoDesafio;
use App\Models\Turma;
use App\Services\NotificacaoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProfessorTesteController extends Controller
{
    public function __construct(private NotificacaoService $notificacaoService)
    {
    }

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
            $desafio = Desafio::create($this->montarPayloadDesafioCriacao($validated));

            $this->sincronizarPerguntasDesafio($desafio, $validated);
        });

        return redirect()->route('dashboard')->with('success', 'Desafio criado com sucesso.');
    }

    public function updateTeste(Request $request, int $id)
    {
        $this->assertProfessor();
        $validated = $this->validarTeste($request);

        $desafio = Desafio::where('id', '=', $id, 'and')
            ->where('id_formador', '=', (int) Auth::id(), 'and')
            ->firstOrFail();

        DB::transaction(function () use ($desafio, $validated) {
            $desafio->update($this->montarPayloadDesafioAtualizacao($validated, $desafio));

            $this->sincronizarPerguntasDesafio($desafio, $validated);
        });

        return redirect()->route('dashboard')->with('success', 'Desafio atualizado com sucesso.');
    }

    private function sincronizarPerguntasDesafio(Desafio $desafio, array $validated): void
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
                'pontuacao_extra' => $pontuacoesPorPergunta[$perguntaId] ?? 1
            ];
        }

        $totalPontuacao = collect($syncData)->sum('pontuacao_extra');
        if ($totalPontuacao > 20) {
            throw ValidationException::withMessages([
                'total_pontuacao' => 'A soma da pontuação das perguntas não pode ultrapassar 20. Ajusta os valores antes de guardar o teste.',
            ]);
        }

        $desafio->perguntas()->sync($syncData);
    }

    private function validarTeste(Request $request): array
    {
        return $request->validate([
            'titulo' => 'required|string|max:150',
            'tipo_desafio' => 'required|string|in:Quiz,Tarefa',
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
            'novas_perguntas.*.resposta_correta_indices' => 'nullable|array',
            'novas_perguntas.*.resposta_correta_indices.*' => 'integer|min:0',
            'novas_perguntas.*.resposta_verdadeiro_falso' => 'nullable|boolean',
            'xp_base' => 'nullable|integer|min:0|max:100000',
            'auto_award_xp' => 'nullable|boolean',
            'badge_existente_id' => 'nullable|integer|exists:Badges,id',
            'nova_badge_nome' => 'nullable|string|max:100|required_with:nova_badge_imagem',
            'nova_badge_descricao' => 'nullable|string|max:500',
            'nova_badge_imagem' => 'nullable|image|max:4096',
            'anexo_global_ficheiro' => 'nullable|file|max:10240',
        ]);
    }

    public function storeTarefa(Request $request)
    {
        $this->assertProfessor();

        $validated = $request->validate([
            'id_desafio' => 'required|integer|exists:Desafio,id',
            'turma_ids' => 'required|array|min:1',
            'turma_ids.*' => 'integer|exists:Turmas,id',
            'data_hora_abertura' => 'required|date',
            'data_hora_fecho' => 'required|date|after:data_hora_abertura',
            'tentativas_maximas' => 'nullable|integer|min:1|max:10',
        ]);

        $professorId = (int) Auth::id();

        $desafio = Desafio::where('id', '=', $validated['id_desafio'], 'and')
            ->where('id_formador', '=', $professorId, 'and')
            ->firstOrFail();

        $turmasPermitidas = Turma::where(function ($query) use ($professorId) {
            $query->whereHas('professores', fn($q) => $q->where('users.id', $professorId))
                ->orWhereHas('disciplinas.professores', fn($q) => $q->where('users.id', $professorId));
        })
            ->pluck('id')
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

        DB::transaction(function () use ($desafio, $turmasSelecionadas, $validated) {
            $this->atualizarJanelaDesafio($desafio, $validated['data_hora_abertura'], $validated['data_hora_fecho']);

            foreach ($turmasSelecionadas as $turmaId) {
                AtribuicaoDesafio::updateOrCreate([
                    'id_desafio' => $desafio->id,
                    'id_turma' => $turmaId,
                    'id_grupo' => null,
                    'id_aluno' => null,
                ], [
                    'data_inicio_tentativas' => $validated['data_hora_abertura'],
                    'data_fim_tentativas' => $validated['data_hora_fecho'],
                    'tentativas_maximas' => $validated['tentativas_maximas'] ?? 1,
                ]);

                $this->notificacaoService->notificarNovoDesafioTurma(
                    (int) $turmaId,
                    (int) $desafio->id,
                    (string) $desafio->titulo,
                );
            }
        });

        return redirect()->route('dashboard')->with('success', 'Desafio atribuido com sucesso.');
    }

    public function updateTarefa(Request $request, int $idTarefa)
    {
        $this->assertProfessor();

        $validated = $request->validate([
            'data_hora_abertura' => 'required|date',
            'data_hora_fecho' => 'required|date|after:data_hora_abertura',
            'tentativas_maximas' => 'nullable|integer|min:1|max:10',
        ]);

        $tarefa = $this->obterTarefaDoProfessor($idTarefa);

        $tarefa->update([
            'data_inicio_tentativas' => $validated['data_hora_abertura'],
            'data_fim_tentativas' => $validated['data_hora_fecho'],
            'tentativas_maximas' => $validated['tentativas_maximas'] ?? null,
        ]);

        if ($tarefa->desafio) {
            $this->atualizarJanelaDesafio($tarefa->desafio, $validated['data_hora_abertura'], $validated['data_hora_fecho']);
        }

        return redirect()->route('dashboard')->with('success', 'Datas do desafio atualizadas com sucesso.');
    }

    public function terminarTarefa(int $idTarefa)
    {
        $this->assertProfessor();

        $tarefa = $this->obterTarefaDoProfessor($idTarefa);
        $agora = now();

        $tarefa->update([
            'data_fim_tentativas' => $agora,
        ]);

        if ($tarefa->desafio) {
            $this->atualizarJanelaDesafio($tarefa->desafio, null, $agora);
        }

        return redirect()->route('dashboard')->with('success', 'Desafio terminado com sucesso.');
    }

    public function destroyTarefa(int $idTarefa)
    {
        $this->assertProfessor();

        $tarefa = $this->obterTarefaDoProfessor($idTarefa);

        AtribuicaoDesafio::destroy((int) $tarefa->id);

        return redirect()->route('dashboard')->with('success', 'Desafio eliminado com sucesso.');
    }

    public function updateCorrecao(Request $request, int $idTesteRealizado)
    {
        $this->assertProfessor();

        $validated = $request->validate([
            'publicar' => 'nullable|boolean',
            'respostas' => 'required|array|min:1',
            'respostas.*.id' => 'required|integer|exists:Respostas_Desafios_Alunos,id',
            'respostas.*.status_correcao' => 'required|string|in:Correto,Errado,Por_Avaliar',
            'respostas.*.pontuacao_obtida' => 'required|integer|min:0|max:20',
            'respostas.*.comentario_formador' => 'nullable|string',
        ]);

        $inscricao = InscricaoDesafio::with(['desafio.perguntas', 'respostas'])
            ->where('id', '=', $idTesteRealizado)
            ->whereHas('desafio', fn($q) => $q->where('id_formador', (int) Auth::id()))
            ->firstOrFail();

        DB::transaction(function () use ($validated, $inscricao) {
            $respostasPayload = collect($validated['respostas'])
                ->keyBy(fn($item) => (int) $item['id']);

            $maxPontuacaoPorPergunta = $inscricao->desafio->perguntas
                ->mapWithKeys(fn($pergunta) => [
                    (int) $pergunta->id => (int) ($pergunta->pivot->pontuacao_extra ?? 1),
                ]);

            $respostasBanco = RespostaDesafioAluno::whereIn('id', $respostasPayload->keys()->all())
                ->where('id_inscricao_desafio', '=', $inscricao->id)
                ->get()
                ->keyBy('id');

            foreach ($respostasPayload as $idResposta => $dadosResposta) {
                /** @var RespostaDesafioAluno|null $resposta */
                $resposta = $respostasBanco->get((int) $idResposta);
                if (!$resposta) {
                    continue;
                }

                $maxPergunta = (int) ($maxPontuacaoPorPergunta->get((int) $resposta->id_pergunta) ?? 1);
                $pontuacaoObtida = (int) $dadosResposta['pontuacao_obtida'];

                if ($pontuacaoObtida > $maxPergunta) {
                    throw ValidationException::withMessages([
                        'respostas' => "A pontuacao de uma pergunta nao pode ultrapassar {$maxPergunta} valor(es).",
                    ]);
                }

                $resposta->update([
                    'status_correcao' => $dadosResposta['status_correcao'],
                    'pontuacao_obtida' => $pontuacaoObtida,
                    'comentario_formador' => $dadosResposta['comentario_formador'] ?? null,
                ]);
            }

            $respostasAtualizadas = RespostaDesafioAluno::where('id_inscricao_desafio', '=', $inscricao->id)->get();
            $totalObtido = (int) $respostasAtualizadas->sum('pontuacao_obtida');

            $pontuacaoPorPergunta = $inscricao->desafio->perguntas
                ->map(fn($pergunta) => (int) ($pergunta->pivot->pontuacao_extra ?? 1));
            $totalMaximo = (int) $pontuacaoPorPergunta->sum();

            $notaFinal = $totalMaximo > 0
                ? round(($totalObtido / $totalMaximo) * 20, 2)
                : 0;

            $temPendentes = $respostasAtualizadas
                ->contains(fn($resposta) => $resposta->status_correcao === 'Por_Avaliar');

            $publicar = (bool) ($validated['publicar'] ?? false);
            $novoEstado = $temPendentes
                ? 'Submetido'
                : ($publicar ? 'Concluido' : 'Submetido');
            $agora = now();

            $feedback = collect($validated['respostas'])
                ->pluck('comentario_formador')
                ->filter(fn($txt) => filled($txt))
                ->implode("\n");

            $inscricao->update([
                'estado' => $novoEstado,
                'data_ultima_tentativa' => $agora,
                'updated_at' => $agora,
            ]);

            if ($publicar && !$temPendentes) {
                $this->notificacaoService->notificarDesafioCorrigido(
                    (int) $inscricao->id_formando,
                    (int) $inscricao->id_desafio,
                    (float) $notaFinal,
                );
            }
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

            $indicesCorretos = collect($dados['resposta_correta_indices'] ?? []);
            if ($indicesCorretos->isEmpty() && isset($dados['resposta_correta_index'])) {
                $indicesCorretos = collect([(int) $dados['resposta_correta_index']]);
            }

            $indicesCorretos = $indicesCorretos
                ->map(fn($index) => (int) $index)
                ->unique()
                ->values();

            if ($indicesCorretos->isEmpty()) {
                abort(422, 'Define pelo menos uma opcao correta valida.');
            }

            $indiceInvalido = $indicesCorretos->contains(
                fn($index) => $index < 0 || $index >= $opcoes->count(),
            );

            if ($indiceInvalido) {
                abort(422, 'Define opcao(oes) correta(s) valida(s).');
            }

            foreach ($opcoes as $index => $textoOpcao) {
                OpcaoPergunta::create([
                    'id_pergunta' => $pergunta->id,
                    'texto_opcao' => $textoOpcao,
                    'is_correct' => $indicesCorretos->contains($index),
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
            'resposta_correta_indices' => 'nullable|array',
            'resposta_correta_indices.*' => 'integer|min:0',
            'resposta_verdadeiro_falso' => 'nullable|boolean',
        ]);
    }

    private function obterTarefaDoProfessor(int $idTarefa): AtribuicaoDesafio
    {
        return AtribuicaoDesafio::with('desafio')
            ->where('id', '=', $idTarefa, 'and')
            ->whereHas('desafio', fn($query) => $query->where('id_formador', '=', (int) Auth::id(), 'and'))
            ->firstOrFail();
    }

    private function montarPayloadDesafioCriacao(array $validated): array
    {
        $tabelaDesafios = $this->obterTabelaDesafio();

        $badgeSelecionada = $this->resolverBadgeDesafio($validated);
        $anexoGlobal = $this->armazenarAnexoGlobal($validated, null);
        $payload = [
            'titulo' => $validated['titulo'],
            'descricao' => $validated['instrucoes'] ?? null,
            'id_formador' => (int) Auth::id(),
            'tipo_desafio' => $this->normalizarTipoDesafioParaTabela((string) $validated['tipo_desafio']),
            'duracao_minutos' => $validated['duracao_minutos'] ?? null,
            'tipo_recorrencia' => 'Unico',
            'exige_submissao' => true,
            'data_inicio' => now(),
            'data_fim' => now()->addDays(30),
            'xp_base' => (int) ($validated['xp_base'] ?? 50),
            'auto_award_xp' => (bool) ($validated['auto_award_xp'] ?? true),
            'badges_json' => $badgeSelecionada ? [$badgeSelecionada] : null,
            'url_anexo_global' => $anexoGlobal,
            'anexos_professor_json' => null,
            'ativa' => true,
        ];

        return $this->filtrarPayloadPorColunasDesafio($payload);
    }

    private function montarPayloadDesafioAtualizacao(array $validated, Desafio $desafio): array
    {
        $badgeSelecionada = $this->resolverBadgeDesafio($validated);
        $anexoGlobal = $this->armazenarAnexoGlobal($validated, $desafio->url_anexo_global);
        $payload = [
            'titulo' => $validated['titulo'],
            'descricao' => $validated['instrucoes'] ?? null,
            'tipo_desafio' => $this->normalizarTipoDesafioParaTabela((string) $validated['tipo_desafio']),
            'duracao_minutos' => $validated['duracao_minutos'] ?? null,
            'xp_base' => isset($validated['xp_base']) ? (int) $validated['xp_base'] : (int) ($desafio->xp_base ?? 50),
            'auto_award_xp' => isset($validated['auto_award_xp'])
                ? (bool) $validated['auto_award_xp']
                : (bool) ($desafio->auto_award_xp ?? true),
            'url_anexo_global' => $anexoGlobal,
            'anexos_professor_json' => null,
        ];

        if ($badgeSelecionada) {
            $payload['badges_json'] = [$badgeSelecionada];
        }

        return $this->filtrarPayloadPorColunasDesafio($payload);
    }

    private function resolverBadgeDesafio(array $validated): ?array
    {
        if (!empty($validated['badge_existente_id'])) {
            $badge = Badge::find((int) $validated['badge_existente_id']);
            if (!$badge) {
                return null;
            }

            return [
                'id' => (int) $badge->id,
                'nome' => (string) $badge->nome,
                'imagem_url' => $badge->imagem_url ?? $badge->icone_url ?? null,
                'origem' => 'existente',
            ];
        }

        if (empty($validated['nova_badge_nome']) && empty($validated['nova_badge_imagem'])) {
            return null;
        }

        $payloadBadge = [
            'nome' => trim((string) ($validated['nova_badge_nome'] ?? 'Nova Badge')),
            'descricao' => $validated['nova_badge_descricao'] ?? null,
            'ativa' => true,
            'raridade' => 1,
            'tipo_criterio' => 'Pontuacao',
            'valor_criterio' => isset($validated['xp_base']) ? (int) $validated['xp_base'] : 50,
        ];

        if (!empty($validated['nova_badge_imagem'])) {
            $caminhoImagem = $validated['nova_badge_imagem']->store('badges/professor', 'public');

            if (Schema::hasColumn('Badges', 'imagem_url')) {
                $payloadBadge['imagem_url'] = $caminhoImagem;
            }

            if (Schema::hasColumn('Badges', 'icone_url')) {
                $payloadBadge['icone_url'] = $caminhoImagem;
            }
        }

        $badge = Badge::create($payloadBadge);

        return [
            'id' => (int) $badge->id,
            'nome' => (string) $badge->nome,
            'imagem_url' => $badge->imagem_url ?? $badge->icone_url ?? null,
            'origem' => 'professor',
        ];
    }

    private function armazenarAnexoGlobal(array $validated, ?string $existente): ?string
    {
        if (empty($validated['anexo_global_ficheiro'])) {
            return $existente;
        }

        return $validated['anexo_global_ficheiro']->store('desafios/anexo-global', 'public');
    }

    private function armazenarAnexosProfessor(array $validated, array $existentes): array
    {
        $anexos = $existentes;

        foreach (($validated['anexos_professor_ficheiros'] ?? []) as $ficheiro) {
            $caminho = $ficheiro->store('desafios/anexos-professor', 'public');
            $anexos[] = [
                'nome' => $ficheiro->getClientOriginalName(),
                'caminho' => $caminho,
                'url' => Storage::disk('public')->url($caminho),
            ];
        }

        return array_values($anexos);
    }

    private function atualizarJanelaDesafio(Desafio $desafio, mixed $dataInicio = null, mixed $dataFim = null): void
    {
        $tabelaDesafios = $this->obterTabelaDesafio();
        $payload = [];

        if ($dataInicio !== null && Schema::hasColumn($tabelaDesafios, 'data_inicio')) {
            $payload['data_inicio'] = $dataInicio;
        }

        if ($dataFim !== null && Schema::hasColumn($tabelaDesafios, 'data_fim')) {
            $payload['data_fim'] = $dataFim;
        }

        if (!empty($payload)) {
            $desafio->update($payload);
        }
    }

    private function filtrarPayloadPorColunasDesafio(array $payload): array
    {
        $tabelaDesafios = $this->obterTabelaDesafio();
        $filtrado = [];
        foreach ($payload as $coluna => $valor) {
            if (Schema::hasColumn($tabelaDesafios, $coluna)) {
                $filtrado[$coluna] = $valor;
            }
        }

        return $filtrado;
    }

    private function obterTabelaDesafio(): string
    {
        return (new Desafio())->getTable();
    }

    private function normalizarTipoDesafioParaTabela(string $tipoRecebido): string
    {
        $tabelaDesafios = $this->obterTabelaDesafio();
        $valoresPermitidos = $this->obterValoresEnumDaColuna($tabelaDesafios, 'tipo_desafio');

        if (empty($valoresPermitidos)) {
            return $tipoRecebido;
        }

        if (in_array($tipoRecebido, $valoresPermitidos, true)) {
            return $tipoRecebido;
        }

        $candidatosPorTipo = [
            'Quiz' => ['Quiz', 'Obrigatorio', 'Opcional'],
            'Tarefa' => ['Tarefa', 'Opcional', 'Obrigatorio'],
        ];

        foreach (($candidatosPorTipo[$tipoRecebido] ?? [$tipoRecebido]) as $candidato) {
            if (in_array($candidato, $valoresPermitidos, true)) {
                return $candidato;
            }
        }

        return $valoresPermitidos[0];
    }

    private function obterValoresEnumDaColuna(string $tabela, string $coluna): array
    {
        $database = DB::connection()->getDatabaseName();

        $resultado = DB::selectOne(
            'SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1',
            [$database, $tabela, $coluna],
        );

        if (!$resultado || !isset($resultado->COLUMN_TYPE) || !is_string($resultado->COLUMN_TYPE)) {
            return [];
        }

        if (!preg_match("/^enum\\((.*)\\)$/", $resultado->COLUMN_TYPE, $matches)) {
            return [];
        }

        return array_values(array_filter(
            str_getcsv($matches[1], ',', "'"),
            fn($valor) => is_string($valor) && $valor !== '',
        ));
    }

    private function assertProfessor(): void
    {
        if (Auth::user()?->id_role !== 2) {
            abort(403);
        }
    }
}
