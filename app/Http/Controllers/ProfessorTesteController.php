<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\OpcaoPergunta;
use App\Models\Pergunta;
use App\Models\Teste;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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
            'novas_perguntas' => 'nullable|array',
            'novas_perguntas.*.texto' => 'required|string|min:5',
            'novas_perguntas.*.tipo_pergunta' => 'required|string|in:Escolha_Multipla,Verdadeiro_Falso,Dissertativa',
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

            foreach ($validated['novas_perguntas'] ?? [] as $novaPergunta) {
                $pergunta = $this->criarPerguntaComOpcoes($novaPergunta, (int) Auth::id());
                $idsPerguntas[] = $pergunta->id;
            }

            $idsPerguntas = collect($idsPerguntas)->unique()->values();

            $syncData = [];
            foreach ($idsPerguntas as $perguntaId) {
                $syncData[$perguntaId] = ['valor_pontuacao' => 1];
            }

            if (!empty($syncData)) {
                $teste->perguntas()->sync($syncData);
            }
        });

        return redirect()->route('dashboard')->with('success', 'Teste criado com sucesso.');
    }

    private function criarPerguntaComOpcoes(array $dados, int $professorId): Pergunta
    {
        $categoria = Categoria::firstOrCreate(['nome' => 'Geral']);

        if (!in_array($dados['tipo_pergunta'], $this->tiposPerguntaPermitidos, true)) {
            abort(422, 'Tipo de pergunta inválido.');
        }

        $pergunta = Pergunta::create([
            'texto' => $dados['texto'],
            'tipo_pergunta' => $dados['tipo_pergunta'],
            'id_categoria' => $categoria->id,
            'id_formador_criador' => $professorId,
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

    private function validarPergunta(Request $request): array
    {
        return $request->validate([
            'texto' => 'required|string|min:5',
            'tipo_pergunta' => 'required|string|in:Escolha_Multipla,Verdadeiro_Falso,Dissertativa',
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
