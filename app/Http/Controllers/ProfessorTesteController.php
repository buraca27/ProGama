<?php

namespace App\Http\Controllers;

use App\Models\OpcaoPergunta;
use App\Models\AtribuicaoDesafio;
use App\Models\Badge;
use App\Models\Desafio;
use App\Models\Pergunta;
use App\Models\RespostaDesafioAluno;
use App\Models\SubmissaoDesafioAluno;
use App\Models\Turma;
use App\Services\NotificacaoService;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProfessorTesteController extends Controller
{
    public function __construct(
        private NotificacaoService $notificacaoService,
        private GamificationService $gamificationService
    ) {
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
        $badgeExistenteId = $request->input('badge_existente_id');

        if ($badgeExistenteId === '' || $badgeExistenteId === 'null') {
            $request->merge([
                'badge_existente_id' => null,
            ]);
        } elseif (is_string($badgeExistenteId) && is_numeric($badgeExistenteId)) {
            $request->merge([
                'badge_existente_id' => (int) $badgeExistenteId,
            ]);
        }

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
            'nova_badge_raridade' => 'nullable|integer|in:1,2,3',
            'anexo_global_ficheiro' => 'nullable|file|max:10240',
            'anexo_global_url_atual' => 'nullable|string',
            'anexos_professor_ficheiros' => 'nullable|array',
            'anexos_professor_ficheiros.*' => 'file|max:10240',
            'anexos_professor_atuais' => 'nullable|array',
            'anexos_professor_atuais.*.nome' => 'nullable|string',
            'anexos_professor_atuais.*.caminho' => 'nullable|string',
            'anexos_professor_atuais.*.url' => 'nullable|string',
        ], [
            'titulo.required' => 'O título do desafio é obrigatório.',
            'titulo.max' => 'O título não pode ter mais de 150 caracteres.',
            'tipo_desafio.required' => 'O tipo de desafio é obrigatório.',
            'tipo_desafio.in' => 'O tipo de desafio selecionado é inválido.',
            'peso_avaliacao.min' => 'O peso da avaliação tem de ser no mínimo 0.',
            'peso_avaliacao.max' => 'O peso da avaliação não pode exceder 100.',
            'duracao_minutos.min' => 'A duração tem de ser pelo menos 1 minuto.',
            'duracao_minutos.max' => 'A duração não pode exceder 600 minutos.',
            'pontuacoes_perguntas.*.id_pergunta.required' => 'O ID da pergunta é obrigatório.',
            'pontuacoes_perguntas.*.id_pergunta.exists' => 'A pergunta selecionada não é válida.',
            'pontuacoes_perguntas.*.valor_pontuacao.min' => 'A pontuação da pergunta tem de ser pelo menos 1.',
            'pontuacoes_perguntas.*.valor_pontuacao.max' => 'A pontuação da pergunta não pode exceder 20.',
            'novas_perguntas.*.texto.required' => 'O texto da nova pergunta é obrigatório.',
            'novas_perguntas.*.texto.min' => 'O texto da nova pergunta tem de ter pelo menos 5 caracteres.',
            'novas_perguntas.*.tipo_pergunta.required' => 'O tipo de pergunta da nova pergunta é obrigatório.',
            'novas_perguntas.*.tipo_pergunta.in' => 'O tipo de pergunta da nova pergunta é inválido.',
            'novas_perguntas.*.id_categoria.required' => 'Tem de selecionar uma categoria para a nova pergunta.',
            'novas_perguntas.*.id_categoria.exists' => 'A categoria selecionada para a nova pergunta é inválida.',
            'novas_perguntas.*.pontuacao.required' => 'A pontuação da nova pergunta é obrigatória.',
            'novas_perguntas.*.pontuacao.min' => 'A pontuação da nova pergunta tem de ser pelo menos 1.',
            'novas_perguntas.*.pontuacao.max' => 'A pontuação da nova pergunta não pode exceder 20.',
            'novas_perguntas.*.opcoes.*.max' => 'Cada opção da nova pergunta não pode exceder 255 caracteres.',
            'xp_base.min' => 'O XP base tem de ser no mínimo 0.',
            'xp_base.max' => 'O XP base não pode exceder 100000.',
            'badge_existente_id.integer' => 'A badge selecionada é inválida.',
            'badge_existente_id.exists' => 'A badge selecionada não foi encontrada.',
            'nova_badge_nome.required_with' => 'O nome da nova badge é obrigatório quando uma imagem é fornecida.',
            'nova_badge_nome.max' => 'O nome da nova badge não pode ter mais de 100 caracteres.',
            'nova_badge_descricao.max' => 'A descrição da nova badge não pode ter mais de 500 caracteres.',
            'nova_badge_imagem.image' => 'O ficheiro da nova badge tem de ser uma imagem válida.',
            'nova_badge_imagem.max' => 'A imagem da nova badge não pode ter mais de 4MB.',
            'nova_badge_raridade.in' => 'A raridade da nova badge é inválida.',
            'anexo_global_ficheiro.max' => 'O anexo global não pode ter mais de 10MB.',
            'anexos_professor_ficheiros.*.max' => 'Cada anexo do professor não pode ter mais de 10MB.',
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
            'sem_consulta' => 'nullable|boolean',
        ], [
            'id_desafio.required' => 'O desafio é obrigatório.',
            'id_desafio.exists' => 'O desafio selecionado é inválido.',
            'turma_ids.required' => 'Tem de selecionar pelo menos uma turma.',
            'turma_ids.min' => 'Tem de selecionar pelo menos uma turma.',
            'turma_ids.*.exists' => 'Uma das turmas selecionadas é inválida.',
            'data_hora_abertura.required' => 'A data e hora de abertura são obrigatórias.',
            'data_hora_abertura.date' => 'A data e hora de abertura têm de ser uma data válida.',
            'data_hora_fecho.required' => 'A data e hora de fecho são obrigatórias.',
            'data_hora_fecho.date' => 'A data e hora de fecho têm de ser uma data válida.',
            'data_hora_fecho.after' => 'A data de fecho tem de ser posterior à data de abertura.',
            'tentativas_maximas.min' => 'O número de tentativas tem de ser pelo menos 1.',
            'tentativas_maximas.max' => 'O número de tentativas não pode exceder 10.',
        ]);

        $professorId = (int) Auth::id();

        $desafio = Desafio::with('categoria')
            ->where('id', '=', $validated['id_desafio'], 'and')
            ->where('id_formador', '=', $professorId, 'and')
            ->firstOrFail();

        $turmasPermitidas = Turma::where(function ($query) use ($professorId) {
            $query->whereHas('professores', fn($q) => $q->where('users.id', $professorId))
                ->orWhereHas('disciplinas.professores', fn($q) => $q->where('users.id', $professorId));
        }, null, null, 'and')
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
                    'tentativas_maximas' => $validated['tentativas_maximas'] ?? null,
                    'sem_consulta' => (bool) ($validated['sem_consulta'] ?? false),
                ]);

                $this->notificacaoService->notificarNovoDesafioTurma(
                    (int) $turmaId,
                    (int) $desafio->id,
                    (string) $desafio->titulo,
                    $validated['data_hora_abertura'],
                    $validated['data_hora_fecho'],
                    $desafio->categoria?->nome,
                    $desafio->duracao_minutos ? (int) $desafio->duracao_minutos : null
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
            'sem_consulta' => 'nullable|boolean',
        ], [
            'data_hora_abertura.required' => 'A data e hora de abertura são obrigatórias.',
            'data_hora_abertura.date' => 'A data e hora de abertura têm de ser uma data válida.',
            'data_hora_fecho.required' => 'A data e hora de fecho são obrigatórias.',
            'data_hora_fecho.date' => 'A data e hora de fecho têm de ser uma data válida.',
            'data_hora_fecho.after' => 'A data de fecho tem de ser posterior à data de abertura.',
            'tentativas_maximas.min' => 'O número de tentativas tem de ser pelo menos 1.',
            'tentativas_maximas.max' => 'O número de tentativas não pode exceder 10.',
        ]);

        $tarefa = $this->obterTarefaDoProfessor($idTarefa);

        $tarefa->update([
            'data_inicio_tentativas' => $validated['data_hora_abertura'],
            'data_fim_tentativas' => $validated['data_hora_fecho'],
            'tentativas_maximas' => $validated['tentativas_maximas'] ?? null,
            'sem_consulta' => (bool) ($validated['sem_consulta'] ?? $tarefa->sem_consulta),
        ]);

        if ($tarefa->desafio) {
            $this->atualizarJanelaDesafio($tarefa->desafio, $validated['data_hora_abertura'], $validated['data_hora_fecho']);
        }

        if ($tarefa->id_turma && $tarefa->desafio) {
            $this->notificacaoService->notificarAlteracaoDatasDesafio(
                (int) $tarefa->id_turma,
                (int) $tarefa->id_desafio,
                (string) $tarefa->desafio->titulo,
                $validated['data_hora_abertura'],
                $validated['data_hora_fecho']
            );
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

        $submissao = SubmissaoDesafioAluno::with(['desafio' => fn($q) => $q->with('perguntas'), 'respostas'])
            ->where('id', '=', $idTesteRealizado)
            ->whereHas('desafio', fn($q) => $q->where('id_formador', (int) Auth::id()))
            ->firstOrFail();

        $isTarefa = ($submissao->desafio->tipo_desafio ?? 'Quiz') === 'Tarefa'
            || $submissao->respostas->isEmpty();

        if ($isTarefa) {
            $validated = $request->validate([
                'publicar' => 'nullable|boolean',
                'nota_final' => 'required|numeric|min:0|max:20',
                'comentario_final' => 'nullable|string|max:5000',
            ]);

            $publicar = (bool) ($validated['publicar'] ?? false);
            $agora = now();
            $notaFinal = round((float) $validated['nota_final'], 2);

            $submissao->update([
                'estado' => $publicar ? 'Concluido' : 'Submetido',
                'data_submissao' => $agora,
                'nota' => $notaFinal,
                'feedback_professor' => $validated['comentario_final'] ?? null,
                'updated_at' => $agora,
            ]);

            if ($publicar) {
                $this->notificacaoService->notificarDesafioCorrigido(
                    (int) $submissao->id_aluno,
                    (int) $submissao->id_desafio,
                    (float) $notaFinal,
                );

                if ($notaFinal >= ($submissao->desafio->nota_minima_passagem ?? 10)) {
                    $this->gamificationService->processarBadgesAutomaticas($submissao);
                }
            }

            return redirect()->route('dashboard')->with('success', 'Correcao atualizada com sucesso.');
        }

        $validated = $request->validate([
            'publicar' => 'nullable|boolean',
            'respostas' => 'required|array|min:1',
            'respostas.*.id' => 'required|integer|exists:Respostas_Desafios_Alunos,id',
            'respostas.*.status_correcao' => 'required|string|in:Correto,Errado,Por_Avaliar',
            'respostas.*.pontuacao_obtida' => 'required|integer|min:0|max:20',
            'respostas.*.comentario_formador' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $submissao) {
            $respostasPayload = collect($validated['respostas'])
                ->keyBy(fn($item) => (int) $item['id']);

            $maxPontuacaoPorPergunta = $submissao->desafio->perguntas
                ->mapWithKeys(fn($pergunta) => [
                    (int) $pergunta->id => (int) ($pergunta->pivot->pontuacao_extra ?? 1),
                ]);

            $respostasBanco = RespostaDesafioAluno::whereIn('id', $respostasPayload->keys()->all(), 'and', false)
                ->where('id_submissao', '=', $submissao->id, 'and')
                ->get()
                ->keyBy('id');

            foreach ($respostasPayload as $idResposta => $dadosResposta) {
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

            $respostasAtualizadas = RespostaDesafioAluno::where('id_submissao', '=', $submissao->id, 'and')->get();
            $totalObtido = (int) $respostasAtualizadas->sum('pontuacao_obtida');

            $pontuacaoPorPergunta = $submissao->desafio->perguntas
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

            $submissao->update([
                'estado' => $novoEstado,
                'data_submissao' => $agora,
                'nota' => $notaFinal,
                'feedback_professor' => $feedback !== '' ? $feedback : null,
                'updated_at' => $agora,
            ]);

            if ($publicar && !$temPendentes) {
                $this->notificacaoService->notificarDesafioCorrigido(
                    (int) $submissao->id_aluno,
                    (int) $submissao->id_desafio,
                    (float) $notaFinal,
                );

                if ($notaFinal >= ($submissao->desafio->nota_minima_passagem ?? 10)) {
                    $this->gamificationService->processarBadgesAutomaticas($submissao);
                }
            }
        });

        return redirect()->route('dashboard')->with('success', 'Correcao atualizada com sucesso.');
    }

    public function downloadAnexoSubmissao(Request $request, int $idTesteRealizado)
    {
        $this->assertProfessor();

        $submissao = SubmissaoDesafioAluno::with(['desafio', 'respostas'])
            ->where('id', '=', $idTesteRealizado)
            ->whereHas('desafio', fn($q) => $q->where('id_formador', '=', (int) Auth::id(), 'and'))
            ->firstOrFail();

        $metadata = is_array($submissao->metadata ?? null) ? $submissao->metadata : [];
        $ficheiros = collect($metadata['ficheiros'] ?? [])
            ->filter(fn ($path) => filled($path))
            ->values()
            ->all();

        if (filled($metadata['ficheiro'])) {
            array_unshift($ficheiros, (string) $metadata['ficheiro']);
        }

        $ficheiros = array_values(array_unique(array_filter($ficheiros)));

        $indice = max(0, (int) $request->integer('indice', 0));
        $ficheiro = $ficheiros[$indice]
            ?? $ficheiros[0]
            ?? $metadata['caminho_ficheiro']
            ?? $metadata['url_ficheiro_submetido']
            ?? $submissao->respostas->firstWhere('url_ficheiro_submetido', '!=', null)?->url_ficheiro_submetido;

        if (!filled($ficheiro)) {
            abort(404, 'Anexo da submissao nao encontrado.');
        }

        $ficheiro = (string) $ficheiro;
        if (Str::startsWith($ficheiro, ['http://', 'https://'])) {
            $pathUrl = parse_url($ficheiro, PHP_URL_PATH) ?: '';
            $ficheiro = Str::startsWith($pathUrl, '/storage/')
                ? Str::after($pathUrl, '/storage/')
                : ltrim($pathUrl, '/');
        }

        if (Str::startsWith($ficheiro, '/storage/')) {
            $ficheiro = Str::after($ficheiro, '/storage/');
        }
        if (Str::startsWith($ficheiro, 'storage/')) {
            $ficheiro = Str::after($ficheiro, 'storage/');
        }

        if (!Storage::disk('public')->exists($ficheiro)) {
            abort(404, 'Anexo da submissao nao encontrado no armazenamento.');
        }

        return Storage::disk('public')->download($ficheiro, basename($ficheiro));
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
        ], [
            'texto.required' => 'O texto da pergunta é obrigatório.',
            'texto.min' => 'O texto da pergunta tem de ter pelo menos 5 caracteres.',
            'tipo_pergunta.required' => 'O tipo de pergunta é obrigatório.',
            'tipo_pergunta.in' => 'O tipo de pergunta selecionado é inválido.',
            'id_categoria.required' => 'Tem de selecionar uma categoria para a pergunta.',
            'id_categoria.exists' => 'A categoria selecionada não é válida.',
            'opcoes.*.max' => 'Cada opção não pode exceder 255 caracteres.',
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
        $badgeSelecionada = $this->resolverBadgeDesafio($validated);
        $anexoGlobal = $this->armazenarAnexoGlobal($validated, null);
        $anexosProfessor = $this->armazenarAnexosProfessor($validated, []);
        $payload = [
            'titulo' => $validated['titulo'],
            'descricao' => $validated['instrucoes'] ?? null,
            'id_formador' => (int) Auth::id(),
            'tipo_desafio' => $this->normalizarTipoDesafioParaTabela((string) $validated['tipo_desafio']),
            'duracao_minutos' => $validated['duracao_minutos'] ?? null,
            'data_inicio' => now(),
            'data_fim' => now()->addDays(30),
            'xp_base' => (int) ($validated['xp_base'] ?? 1),
            'auto_award_xp' => (bool) ($validated['auto_award_xp'] ?? true),
            'badges_json' => $badgeSelecionada ? [$badgeSelecionada] : null,
            'descricao_ficheiro' => $anexoGlobal,
            'anexos_professor_json' => !empty($anexosProfessor) ? $anexosProfessor : null,
            'ativa' => true,
        ];

        return $this->filtrarPayloadPorColunasDesafio($payload);
    }

    private function montarPayloadDesafioAtualizacao(array $validated, Desafio $desafio): array
    {
        $badgeSelecionada = $this->resolverBadgeDesafio($validated);
        $anexoGlobalExistente = array_key_exists('anexo_global_url_atual', $validated)
            ? ($validated['anexo_global_url_atual'] ?: null)
            : ($desafio->descricao_ficheiro);
        $anexoGlobal = $this->armazenarAnexoGlobal($validated, $anexoGlobalExistente);
        $anexosExistentes = is_array($validated['anexos_professor_atuais'] ?? null)
            ? array_values(array_filter(
                $validated['anexos_professor_atuais'],
                fn ($anexo) => is_array($anexo) && (!empty($anexo['caminho']) || !empty($anexo['url'])),
            ))
            : (is_array($desafio->anexos_professor_json ?? null) ? $desafio->anexos_professor_json : []);
        $anexosProfessor = $this->armazenarAnexosProfessor($validated, $anexosExistentes);
        $payload = [
            'titulo' => $validated['titulo'],
            'descricao' => $validated['instrucoes'] ?? null,
            'tipo_desafio' => $this->normalizarTipoDesafioParaTabela((string) $validated['tipo_desafio']),
            'duracao_minutos' => $validated['duracao_minutos'] ?? null,
            'xp_base' => isset($validated['xp_base']) ? (int) $validated['xp_base'] : (int) ($desafio->xp_base ?? 1),
            'auto_award_xp' => isset($validated['auto_award_xp'])
                ? (bool) $validated['auto_award_xp']
                : (bool) ($desafio->auto_award_xp ?? true),
            'descricao_ficheiro' => $anexoGlobal,
            'anexos_professor_json' => !empty($anexosProfessor) ? $anexosProfessor : null,
        ];

        if ($badgeSelecionada) {
            $payload['badges_json'] = [$badgeSelecionada];
        }

        return $this->filtrarPayloadPorColunasDesafio($payload);
    }

    private function resolverBadgeDesafio(array $validated): ?array
    {
        if (!empty($validated['badge_existente_id'])) {
            $badge = Badge::find((int) $validated['badge_existente_id'], ['*']);
            if (!$badge) {
                return null;
            }

            return [
                'id' => (int) $badge->id,
                'nome' => (string) $badge->nome,
                'imagem_url' => $badge->icone_url ?? null,
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
            'raridade' => isset($validated['nova_badge_raridade']) ? (int) $validated['nova_badge_raridade'] : 1,
            'tipo_criterio' => 'Pontuacao',
            'valor_criterio' => isset($validated['xp_base']) ? (int) $validated['xp_base'] : 1,
        ];

        if (!empty($validated['nova_badge_imagem'])) {
            $caminhoImagem = $validated['nova_badge_imagem']->store('badges/professor', 'public');
            $payloadBadge['icone_url'] = $caminhoImagem;
        }

        $badge = Badge::create($payloadBadge);

        return [
            'id' => (int) $badge->id,
            'nome' => (string) $badge->nome,
            'imagem_url' => $badge->icone_url ?? null,
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
