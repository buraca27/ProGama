<?php

namespace App\Http\Controllers;

use App\Models\RespostaAluno;
use App\Models\TesteAtribuicao;
use App\Models\TesteRealizado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AlunoTesteController extends Controller
{
    public function submeter(Request $request, int $idTarefa)
    {
        $this->assertAluno();

        $aluno = $request->user();
        $tarefa = $this->obterTarefaDoAluno($idTarefa, (int) $aluno->id);

        $agora = now();
        if ($tarefa->data_hora_abertura && $agora->lt($tarefa->data_hora_abertura)) {
            throw ValidationException::withMessages([
                'tarefa' => 'Este teste ainda nao abriu para resolucao.',
            ]);
        }

        if ($tarefa->data_hora_fecho && $agora->gt($tarefa->data_hora_fecho)) {
            throw ValidationException::withMessages([
                'tarefa' => 'O prazo para este teste ja terminou.',
            ]);
        }

        $validated = $request->validate([
            'respostas' => 'required|array|min:1',
            'respostas.*.id_pergunta' => 'required|integer',
            'respostas.*.id_opcao_escolhida' => 'nullable|integer|exists:Opcoes_Pergunta,id',
            'respostas.*.resposta_texto' => 'nullable|string',
        ]);

        $teste = $tarefa->teste;
        $perguntasTeste = $teste->perguntas->keyBy('id');

        if ($perguntasTeste->isEmpty()) {
            throw ValidationException::withMessages([
                'respostas' => 'Este teste nao possui perguntas para responder.',
            ]);
        }

        $respostasPorPergunta = collect($validated['respostas'])
            ->keyBy(fn($resposta) => (int) $resposta['id_pergunta']);

        foreach ($perguntasTeste as $pergunta) {
            $respostaPayload = $respostasPorPergunta->get((int) $pergunta->id);

            if (!$respostaPayload) {
                throw ValidationException::withMessages([
                    'respostas' => 'Todas as perguntas devem ser respondidas antes da submissao.',
                ]);
            }

            if ($pergunta->tipo_pergunta === 'Dissertativa') {
                if (!filled($respostaPayload['resposta_texto'] ?? null)) {
                    throw ValidationException::withMessages([
                        'respostas' => 'A resposta dissertativa nao pode ficar vazia.',
                    ]);
                }

                continue;
            }

            $idOpcaoEscolhida = $respostaPayload['id_opcao_escolhida'] ?? null;
            if (!$idOpcaoEscolhida) {
                throw ValidationException::withMessages([
                    'respostas' => 'Seleciona uma opcao para todas as perguntas objetivas.',
                ]);
            }

            $opcaoValida = $pergunta->opcoes->contains(fn($opcao) => (int) $opcao->id === (int) $idOpcaoEscolhida);
            if (!$opcaoValida) {
                throw ValidationException::withMessages([
                    'respostas' => 'Foi selecionada uma opcao invalida para uma das perguntas.',
                ]);
            }
        }

        DB::transaction(function () use ($aluno, $teste, $validated) {
            $testeRealizado = TesteRealizado::where('id_teste', '=', (int) $teste->id, 'and')
                ->where('id_aluno', '=', (int) $aluno->id, 'and')
                ->latest('id')
                ->first();

            if ($testeRealizado && $testeRealizado->data_submissao) {
                throw ValidationException::withMessages([
                    'tarefa' => 'Este teste ja foi submetido por ti.',
                ]);
            }

            if (!$testeRealizado) {
                $testeRealizado = TesteRealizado::create([
                    'id_teste' => (int) $teste->id,
                    'id_aluno' => (int) $aluno->id,
                    'data_inicio_resolucao' => now(),
                    'estado' => 'Em_Resolucao',
                ]);
            }

            $perguntasTeste = $teste->perguntas->keyBy('id');

            foreach ($validated['respostas'] as $respostaPayload) {
                $idPergunta = (int) $respostaPayload['id_pergunta'];
                $pergunta = $perguntasTeste->get($idPergunta);

                if (!$pergunta) {
                    continue;
                }

                $idOpcaoEscolhida = isset($respostaPayload['id_opcao_escolhida'])
                    ? (int) $respostaPayload['id_opcao_escolhida']
                    : null;

                $statusCorrecao = 'Por_Avaliar';
                $pontuacaoObtida = 0;

                if ($pergunta->tipo_pergunta !== 'Dissertativa' && $idOpcaoEscolhida) {
                    $opcao = $pergunta->opcoes->firstWhere('id', $idOpcaoEscolhida);
                    $isCorreta = (bool) ($opcao?->is_correct ?? false);

                    $statusCorrecao = $isCorreta ? 'Correto' : 'Errado';
                    $pontuacaoObtida = $isCorreta
                        ? (int) ($pergunta->pivot->valor_pontuacao ?? 1)
                        : 0;
                }

                RespostaAluno::updateOrCreate([
                    'id_teste_realizado' => (int) $testeRealizado->id,
                    'id_pergunta' => $idPergunta,
                ], [
                    'id_opcao_escolhida' => $idOpcaoEscolhida,
                    'resposta_texto' => filled($respostaPayload['resposta_texto'] ?? null)
                        ? trim((string) $respostaPayload['resposta_texto'])
                        : null,
                    'status_correcao' => $statusCorrecao,
                    'pontuacao_obtida' => $pontuacaoObtida,
                    'comentario_formador' => null,
                ]);
            }

            $testeRealizado->update([
                'data_submissao' => now(),
                'estado' => 'Aguardando_Correcao',
            ]);
        });

        return redirect()->route('dashboard')->with('success', 'Teste submetido com sucesso.');
    }

    private function obterTarefaDoAluno(int $idTarefa, int $idAluno): TesteAtribuicao
    {
        $aluno = Auth::user();
        $idTurmaAluno = (int) ($aluno?->id_turma ?? 0);

        return TesteAtribuicao::with([
            'teste.perguntas' => fn($query) => $query->with('opcoes'),
        ])
            ->where('id', '=', $idTarefa, 'and')
            ->where(function ($query) use ($idAluno, $idTurmaAluno) {
                $query->where('id_aluno', '=', $idAluno, 'and')
                    ->orWhere(function ($or) use ($idTurmaAluno) {
                        $or->whereNull('id_aluno')
                            ->where('id_turma', '=', $idTurmaAluno, 'and');
                    });
            })
            ->firstOrFail();
    }

    private function assertAluno(): void
    {
        if (Auth::user()?->id_role !== 3) {
            abort(403);
        }
    }
}
