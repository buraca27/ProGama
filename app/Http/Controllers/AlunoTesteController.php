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

        // true  → submissão final com todas as validações
        // false → guardar rascunho (sem validar respostas completas)
        $finalizar = filter_var($request->input('finalizar', true), FILTER_VALIDATE_BOOLEAN);

        // Validação de janela de tempo — aplica-se SEMPRE (rascunho e final)
        $agora = now();

        if ($tarefa->data_hora_abertura && $agora->lt($tarefa->data_hora_abertura)) {
            throw ValidationException::withMessages([
                'tarefa' => 'Este teste ainda não abriu para resolução.',
            ]);
        }

        if ($tarefa->data_hora_fecho && $agora->gt($tarefa->data_hora_fecho)) {
            throw ValidationException::withMessages([
                'tarefa' => 'O prazo para este teste já terminou.',
            ]);
        }

        // Validação base das respostas recebidas
        $validated = $request->validate([
            'respostas' => 'required|array|min:1',
            'respostas.*.id_pergunta' => 'required|integer',
            'respostas.*.id_opcao_escolhida' => 'nullable|integer|exists:Opcoes_Pergunta,id',
            'respostas.*.resposta_texto' => 'nullable|string',
        ]);

        $teste = $tarefa->teste;
        $perguntasTeste = $teste->perguntas->keyBy('id');
        $tentativasMaximas = $tarefa->tentativas_maximas ? (int) $tarefa->tentativas_maximas : null;
        $tentativasFeitas = TesteRealizado::where('id_teste', (int) $teste->id)
            ->where('id_aluno', (int) $aluno->id)
            ->whereNotNull('data_submissao')
            ->count();

        if ($tentativasMaximas && $tentativasFeitas >= $tentativasMaximas && $finalizar) {
            throw ValidationException::withMessages([
                'tarefa' => 'Atingiste o número máximo de tentativas para este teste.',
            ]);
        }

        if ($perguntasTeste->isEmpty()) {
            throw ValidationException::withMessages([
                'respostas' => 'Este teste não possui perguntas para responder.',
            ]);
        }

        // Validações adicionais apenas na submissão final
        if ($finalizar) {
            $respostasPorPergunta = collect($validated['respostas'])
                ->keyBy(fn($r) => (int) $r['id_pergunta']);

            foreach ($perguntasTeste as $pergunta) {
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

                $idOpcaoEscolhida = $respostaPayload['id_opcao_escolhida'] ?? null;

                if (!$idOpcaoEscolhida) {
                    throw ValidationException::withMessages([
                        'respostas' => 'Seleciona uma opção para todas as perguntas objetivas.',
                    ]);
                }

                $opcaoValida = $pergunta->opcoes->contains(
                    fn($opcao) => (int) $opcao->id === (int) $idOpcaoEscolhida
                );

                if (!$opcaoValida) {
                    throw ValidationException::withMessages([
                        'respostas' => 'Foi selecionada uma opção inválida para uma das perguntas.',
                    ]);
                }
            }
        }

        DB::transaction(function () use ($aluno, $teste, $validated, $finalizar, $tentativasMaximas, $tentativasFeitas) {
            // Obter o último teste realizado do aluno para este teste
            $testeRealizado = TesteRealizado::where('id_teste', (int) $teste->id)
                ->where('id_aluno', (int) $aluno->id)
                ->latest('id')
                ->first();

            // Se o último registro já foi submetido e ainda há tentativas disponíveis,
            // cria um novo registo para o próximo ciclo de tentativa.
            if ($testeRealizado && $testeRealizado->data_submissao) {
                if ($tentativasMaximas && $tentativasFeitas >= $tentativasMaximas) {
                    throw ValidationException::withMessages([
                        'tarefa' => 'Atingiste o número máximo de tentativas para este teste.',
                    ]);
                }

                $testeRealizado = TesteRealizado::create([
                    'id_teste' => (int) $teste->id,
                    'id_aluno' => (int) $aluno->id,
                    'data_inicio_resolucao' => now(),
                    'estado' => 'Em_Resolucao',
                ]);
            }

            // Criar registo se ainda não existe (primeiro rascunho ou submissão direta)
            if (!$testeRealizado) {
                $testeRealizado = TesteRealizado::create([
                    'id_teste' => (int) $teste->id,
                    'id_aluno' => (int) $aluno->id,
                    'data_inicio_resolucao' => now(),
                    'estado' => 'Em_Resolucao',
                ]);
            }

            $perguntasTeste = $teste->perguntas->keyBy('id');

            // Guardar / actualizar cada resposta
            foreach ($validated['respostas'] as $respostaPayload) {
                $idPergunta = (int) $respostaPayload['id_pergunta'];
                $pergunta = $perguntasTeste->get($idPergunta);

                if (!$pergunta) {
                    continue;
                }

                $idOpcaoEscolhida = isset($respostaPayload['id_opcao_escolhida'])
                    ? (int) $respostaPayload['id_opcao_escolhida']
                    : null;

                // Correcção automática para objetivas; dissertativas ficam Por_Avaliar
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

                RespostaAluno::updateOrCreate(
                    [
                        'id_teste_realizado' => (int) $testeRealizado->id,
                        'id_pergunta' => $idPergunta,
                    ],
                    [
                        'id_opcao_escolhida' => $idOpcaoEscolhida ?: null,
                        'resposta_texto' => filled($respostaPayload['resposta_texto'] ?? null)
                            ? trim((string) $respostaPayload['resposta_texto'])
                            : null,
                        'status_correcao' => $statusCorrecao,
                        'pontuacao_obtida' => $pontuacaoObtida,
                        'comentario_formador' => null,
                    ]
                );
            }

            // Actualizar estado conforme rascunho ou submissão final
            if ($finalizar) {
                $testeRealizado->update([
                    'data_submissao' => now(),
                    'estado' => 'Aguardando_Correcao',
                ]);
            } else {
                // Apenas garante que estado reflecte rascunho em curso
                $testeRealizado->update([
                    'estado' => 'Em_Resolucao',
                ]);
            }
        });

        if ($finalizar) {
            return redirect()->route('dashboard')
                ->with('success', 'Teste submetido com sucesso.');
        }

        // Rascunho: volta para a mesma página sem redirect completo
        return back()->with('success', 'Rascunho guardado com sucesso.');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function obterTarefaDoAluno(int $idTarefa, int $idAluno): TesteAtribuicao
    {
        $aluno = Auth::user();
        $idTurmaAluno = (int) ($aluno?->id_turma ?? 0);

        return TesteAtribuicao::with([
            'teste.perguntas' => fn($query) => $query->with('opcoes'),
        ])
            ->where('id', $idTarefa)
            ->where(function ($query) use ($idAluno, $idTurmaAluno) {
                $query->where('id_aluno', $idAluno)
                    ->orWhere(function ($or) use ($idTurmaAluno) {
                        $or->whereNull('id_aluno')
                            ->where('id_turma', $idTurmaAluno);
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
