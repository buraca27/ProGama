<?php

namespace App\Http\Controllers;

use App\Models\Desafio;
use App\Models\DesafioAtribuicao;
use App\Models\InscricaoDesafio;
use App\Models\RespostaDesafioAluno;
use App\Services\NotificacaoService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AlunoDesafioController extends Controller
{
    public function __construct(private NotificacaoService $notificacaoService)
    {
    }

    public function submeter(Request $request, int $idAtribuicao)
    {
        $this->assertAluno();

        $aluno = $request->user();
        $atribuicao = $this->obterAtribuicaoDoAluno($idAtribuicao, (int) $aluno->id);
        $desafio = $atribuicao->desafio;

        if (!$desafio || !(bool) $desafio->ativo) {
            throw ValidationException::withMessages([
                'desafio' => 'Este desafio não está disponível.',
            ]);
        }

        $finalizar = filter_var($request->input('finalizar', true), FILTER_VALIDATE_BOOLEAN);
        $agora = now();

        if ($desafio->data_inicio && $agora->lt($desafio->data_inicio)) {
            throw ValidationException::withMessages([
                'desafio' => 'Este desafio ainda não abriu para resolução.',
            ]);
        }

        if ($desafio->data_fim && $agora->gt($desafio->data_fim)) {
            throw ValidationException::withMessages([
                'desafio' => 'O prazo para este desafio já terminou.',
            ]);
        }

        $perguntasDesafio = $this->obterPerguntasDesafio($desafio)->keyBy('id');

        if ($perguntasDesafio->isEmpty()) {
            throw ValidationException::withMessages([
                'respostas' => 'Este desafio não possui perguntas para responder.',
            ]);
        }

        $validated = $request->validate([
            'respostas' => 'required|array|min:1',
            'respostas.*.id_pergunta' => 'required|integer',
            'respostas.*.id_opcao_escolhida' => 'nullable|integer|exists:Opcoes_Pergunta,id',
            'respostas.*.ids_opcoes_escolhidas' => 'nullable|array',
            'respostas.*.ids_opcoes_escolhidas.*' => 'integer|exists:Opcoes_Pergunta,id',
            'respostas.*.resposta_texto' => 'nullable|string',
        ]);

        if ($finalizar) {
            $respostasPorPergunta = collect($validated['respostas'])
                ->keyBy(fn($r) => (int) $r['id_pergunta']);

            foreach ($perguntasDesafio as $pergunta) {
                $respostaPayload = $respostasPorPergunta->get((int) $pergunta->id);

                if (!$respostaPayload) {
                    throw ValidationException::withMessages([
                        'respostas' => 'Todas as perguntas devem ser respondidas antes da submissão.',
                    ]);
                }

                if ($pergunta->tipo_pergunta === 'Dissertativa') {
                    if (!filled($respostaPayload['resposta_texto'] ?? null)) {
                        throw ValidationException::withMessages([
                            'respostas' => 'A resposta dissertativa não pode ficar vazia.',
                        ]);
                    }
                    continue;
                }

                $idsSelecionados = collect($respostaPayload['ids_opcoes_escolhidas'] ?? [])
                    ->map(fn($id) => (int) $id)
                    ->filter()
                    ->values();

                $idOpcaoEscolhida = isset($respostaPayload['id_opcao_escolhida'])
                    ? (int) $respostaPayload['id_opcao_escolhida']
                    : null;

                if ($idsSelecionados->isEmpty() && !$idOpcaoEscolhida) {
                    throw ValidationException::withMessages([
                        'respostas' => 'Seleciona uma opção para todas as perguntas objetivas.',
                    ]);
                }

                $idsParaValidar = $idsSelecionados->isNotEmpty()
                    ? $idsSelecionados
                    : collect([$idOpcaoEscolhida]);

                $opcoesPergunta = $pergunta->opcoes->pluck('id')->map(fn($id) => (int) $id);
                $todasValidas = $idsParaValidar->every(fn($id) => $opcoesPergunta->contains($id));

                if (!$todasValidas) {
                    throw ValidationException::withMessages([
                        'respostas' => 'Foi selecionada uma opção inválida para uma das perguntas.',
                    ]);
                }
            }
        }

        DB::transaction(function () use ($aluno, $desafio, $validated, $finalizar, $perguntasDesafio) {
            $inscricao = InscricaoDesafio::where('id_desafio', (int) $desafio->id)
                ->where('id_formando', (int) $aluno->id)
                ->latest('id')
                ->first();

            if ($inscricao && in_array($inscricao->estado, ['Submetido', 'Concluido', 'Falhado'], true)) {
                $inscricao = null;
            }

            if (!$inscricao) {
                $inscricao = InscricaoDesafio::create([
                    'id_desafio' => (int) $desafio->id,
                    'id_formando' => (int) $aluno->id,
                    'estado' => 'Em_Resolucao',
                    'data_inicio_resolucao' => now(),
                ]);
            }

            if ($desafio->duracao_minutos && $inscricao->data_inicio_resolucao) {
                $limiteDuracao = $inscricao->data_inicio_resolucao->copy()->addMinutes((int) $desafio->duracao_minutos);

                if (now()->gt($limiteDuracao)) {
                    $inscricao->update([
                        'estado' => 'Falhado',
                        'data_ultima_tentativa' => now(),
                    ]);

                    throw ValidationException::withMessages([
                        'desafio' => 'O tempo máximo para resolver este desafio foi excedido.',
                    ]);
                }
            }

            foreach ($validated['respostas'] as $respostaPayload) {
                $idPergunta = (int) $respostaPayload['id_pergunta'];
                $pergunta = $perguntasDesafio->get($idPergunta);

                if (!$pergunta) {
                    continue;
                }

                $idsSelecionados = collect($respostaPayload['ids_opcoes_escolhidas'] ?? [])
                    ->map(fn($id) => (int) $id)
                    ->filter()
                    ->values();

                $idOpcaoEscolhida = isset($respostaPayload['id_opcao_escolhida'])
                    ? (int) $respostaPayload['id_opcao_escolhida']
                    : null;

                if ($idsSelecionados->isEmpty() && $idOpcaoEscolhida) {
                    $idsSelecionados = collect([$idOpcaoEscolhida]);
                }

                $statusCorrecao = 'Por_Avaliar';
                $pontuacaoObtida = 0;

                if ($pergunta->tipo_pergunta !== 'Dissertativa' && $idsSelecionados->isNotEmpty()) {
                    $opcoesCorretas = $pergunta->opcoes
                        ->filter(fn($opcao) => (bool) ($opcao->is_correct ?? false))
                        ->pluck('id')
                        ->map(fn($id) => (int) $id)
                        ->sort()
                        ->values();

                    $selecionadasOrdenadas = $idsSelecionados->sort()->values();
                    $isCorreta = $opcoesCorretas->isNotEmpty()
                        ? $selecionadasOrdenadas->all() === $opcoesCorretas->all()
                        : false;

                    $valorBase = (int) ($pergunta->pivot->pontuacao_extra ?? 1);
                    $statusCorrecao = $isCorreta ? 'Correto' : 'Errado';
                    $pontuacaoObtida = $isCorreta ? $valorBase : 0;
                }

                RespostaDesafioAluno::updateOrCreate(
                    [
                        'id_inscricao_desafio' => (int) $inscricao->id,
                        'id_pergunta' => $idPergunta,
                    ],
                    [
                        'id_opcao_escolhida' => $idsSelecionados->first() ?: null,
                        'ids_opcoes_escolhidas' => $idsSelecionados->isNotEmpty() ? $idsSelecionados->values()->all() : null,
                        'resposta_texto' => filled($respostaPayload['resposta_texto'] ?? null)
                            ? trim((string) $respostaPayload['resposta_texto'])
                            : null,
                        'status_correcao' => $statusCorrecao,
                        'pontuacao_obtida' => $pontuacaoObtida,
                        'comentario_formador' => null,
                    ]
                );
            }

            if ($finalizar) {
                $inscricao->update([
                    'estado' => 'Submetido',
                    'data_ultima_tentativa' => now(),
                ]);
            } else {
                $inscricao->update([
                    'estado' => 'Em_Resolucao',
                ]);
            }
        });

        if ($finalizar) {
            $this->notificarProfessorSobreSubmissao($aluno, $desafio);

            return redirect()->route('dashboard')
                ->with('success', 'Desafio submetido com sucesso.');
        }

        return back()->with('success', 'Rascunho do desafio guardado com sucesso.');
    }

    private function obterAtribuicaoDoAluno(int $idAtribuicao, int $idAluno): DesafioAtribuicao
    {
        $aluno = Auth::user();
        $idTurmaAluno = (int) ($aluno?->id_turma ?? 0);

        return DesafioAtribuicao::with([
            'desafio.perguntas' => fn($query) => $query->with('opcoes'),
            'desafio.testeAssociado.perguntas' => fn($query) => $query->with('opcoes'),
        ])
            ->where('id', $idAtribuicao)
            ->where(function ($query) use ($idAluno, $idTurmaAluno) {
                $query->where('id_aluno', $idAluno)
                    ->orWhere(function ($or) use ($idTurmaAluno) {
                        $or->whereNull('id_aluno')
                            ->where('id_turma', $idTurmaAluno);
                    });
            })
            ->firstOrFail();
    }

    private function obterPerguntasDesafio(Desafio $desafio): Collection
    {
        if ($desafio->relationLoaded('perguntas') && $desafio->perguntas->isNotEmpty()) {
            return $desafio->perguntas;
        }

        if ($desafio->relationLoaded('testeAssociado') && $desafio->testeAssociado) {
            return $desafio->testeAssociado->perguntas ?? collect();
        }

        $desafio->loadMissing('perguntas.opcoes', 'testeAssociado.perguntas.opcoes');

        if ($desafio->perguntas->isNotEmpty()) {
            return $desafio->perguntas;
        }

        return $desafio->testeAssociado?->perguntas ?? collect();
    }

    private function notificarProfessorSobreSubmissao($aluno, Desafio $desafio): void
    {
        $idProfessor = (int) ($desafio->id_formador ?? 0);
        if (!$idProfessor) {
            return;
        }

        $aluno->loadMissing('turma');
        $nomeTurma = $aluno->turma?->nome ?? 'Turma desconhecida';

        $this->notificacaoService->notificarProfessorSubmissao(
            $idProfessor,
            (string) $aluno->name,
            $nomeTurma,
            (string) $desafio->titulo,
            (int) $desafio->id,
        );
    }

    private function assertAluno(): void
    {
        if (Auth::user()?->id_role !== 3) {
            abort(403);
        }
    }
}
