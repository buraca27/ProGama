<?php

namespace App\Http\Controllers;

use App\Models\Turma;
use App\Models\Disciplina;
use App\Models\Desafio;
use App\Models\Categoria;
use App\Models\AtribuicaoDesafio;
use App\Models\SubmissaoDesafioAluno;
use App\Models\User;
use App\Models\Notificacao;
use App\Models\Pergunta;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request, GamificationService $gamificationService)
    {
        $user = $request->user();
        $perguntasProfessor = [];
        $perguntasBancoProfessor = null;
        $correcoesProfessor = null;
        $submissoesAluno = [];
        $desafiosAluno = [];
        $inscricoesDesafiosAluno = [];

        // 1. Estatísticas Gerais
        $estatisticas = [
            'total_users' => DB::table('users')->count(),
            'total_turmas' => $this->tryCatchCount('Turmas'),
            'total_desafios' => $this->tryCatchCount('Desafio'),
            'total_disciplinas' => $this->tryCatchCount('Disciplinas'),
        ];

        // 2. Mapeamento de Cargo
        $roleMap = [1 => 'admin', 2 => 'professor', 3 => 'aluno'];
        $cargoReal = $roleMap[$user->id_role] ?? 'aluno';

        // 3. Definição das variáveis que estavam em falta (sublinhadas a vermelho)
        $turmas = match ($user->id_role) {
            1 => Turma::with(['professores', 'alunos'])->get(),
            2 => User::find($user->id, ['*'])
                ->turmasLecionadas()
                ->with(['alunos'])
                ->get()
                ->map(function ($turma) {
                    $professoresDaTurma = User::where('id_role', 2)
                        ->whereHas('turmasLecionadas', fn($query) => $query->where('Turmas.id', (int) $turma->id))
                        ->get();

                    $turma->setRelation('professores', $professoresDaTurma);

                    return $turma;
                }),
            3 => $user->id_turma ? Turma::where('id', '=', $user->id_turma, 'and')->with(['professores', 'alunos'])->get() : [],
            default => [],
        };

        $disciplinas = match ($user->id_role) {
            2 => Disciplina::with(['professores', 'turmas'])
                ->whereHas('professores', fn($query) => $query->where('users.id', (int) $user->id))
                ->get(),
            3 => $user->id_turma
                ? (Turma::find((int) $user->id_turma)?->disciplinas()
                    ->with([
                        'professores',
                        'turmas' => fn($query) => $query
                            ->where('Turmas.id', (int) $user->id_turma)
                            ->with('alunos'),
                    ])
                    ->get() ?? collect())
                : [],
            default => Disciplina::with(['professores', 'turmas'])->get(),
        };
        $categorias = Categoria::withCount(['desafios', 'testes'])->orderBy('nome')->get();

        // 4. Lógica para Tarefas do Aluno
        $tarefasAluno = [];
        if ($cargoReal === 'aluno') {
            $idTurmaAluno = $user->id_turma ? (int) $user->id_turma : null;

            $tarefasAluno = AtribuicaoDesafio::with([
                'desafio' => fn($query) => $query->with([
                    'perguntas' => fn($perguntas) => $perguntas
                        ->with('opcoes')
                        ->withPivot('pontuacao_extra'),
                ]),
            ])
                ->where(function ($query) use ($user, $idTurmaAluno) {
                    $query->where('id_aluno', '=', (int) $user->id, 'and')
                        ->orWhere(function ($or) use ($idTurmaAluno) {
                            $or->whereNull('id_aluno');

                            if ($idTurmaAluno) {
                                $or->where('id_turma', '=', $idTurmaAluno, 'and');
                            } else {
                                $or->whereRaw('1 = 0');
                            }
                        });
                })
                ->orderBy('created_at', 'desc')
                ->get();

            $idsDesafiosAtribuidos = $tarefasAluno
                ->pluck('id_desafio')
                ->map(fn($id) => (int) $id)
                ->unique()
                ->values();

            if ($idsDesafiosAtribuidos->isNotEmpty()) {
                $submissoesAluno = SubmissaoDesafioAluno::with([
                    'respostas:id,id_submissao,id_pergunta,ids_opcoes_escolhidas,resposta_texto,correta,pontuacao',
                ])
                    ->where('id_aluno', (int) $user->id)
                    ->whereIn('id_desafio', $idsDesafiosAtribuidos->all())
                    ->orderByDesc('created_at')
                    ->get();
            }

            $desafiosAluno = $tarefasAluno;
            $inscricoesDesafiosAluno = $submissoesAluno;
        }

        $perguntasProfessor = [];
        $perguntasBancoProfessor = null;
        $trabalhosPendentes = 0;

        if ($cargoReal === 'professor') {
            $mostrarApenasMinhasPerguntas = (string) $request->query('perguntas_minhas', '1') !== '0';

            $perguntasProfessor = Pergunta::with('opcoes')
                ->orderBy('created_at', 'desc')
                ->get(['id', 'texto', 'tipo_pergunta', 'id_categoria', 'id_formador_criador', 'url_anexo_pergunta']);

            $perguntasBancoProfessorQuery = Pergunta::with('opcoes')
                ->orderBy('created_at', 'desc');

            if ($mostrarApenasMinhasPerguntas) {
                $perguntasBancoProfessorQuery->where('id_formador_criador', '=', (int) $user->id, 'and');
            }

            if ($request->filled('perguntas_categoria')) {
                $categoriaId = $request->integer('perguntas_categoria');
                if ($categoriaId > 0) {
                    $perguntasBancoProfessorQuery->where('id_categoria', '=', $categoriaId, 'and');
                }
            }

            if ($request->filled('perguntas_q')) {
                $textoPesquisa = trim((string) $request->string('perguntas_q'));
                $perguntasBancoProfessorQuery->where('texto', 'like', '%' . $textoPesquisa . '%');
            }

            $perguntasBancoProfessor = $perguntasBancoProfessorQuery
                ->paginate(8, ['*'], 'perguntas_page')
                ->withQueryString();

            $correcoesProfessor = SubmissaoDesafioAluno::with([
                'aluno:id,name,email',
                'desafio:id,titulo,id_formador',
                'desafio.perguntas:id',
                'respostas.pergunta:id,texto,tipo_pergunta',
                'respostas.pergunta.opcoes:id,id_pergunta,texto_opcao,is_correct',
            ])
                ->whereHas('desafio', fn($query) => $query->where('id_formador', $user->id))
                ->orderByRaw("CASE WHEN estado = 'Submetido' THEN 0 WHEN estado = 'Em_Resolucao' THEN 1 ELSE 2 END")
                ->orderByDesc('created_at')
                ->paginate(10, ['*'], 'correcoes_page')
                ->withQueryString()
                ->through(function (SubmissaoDesafioAluno $submissao) use ($user) {
                    $perguntas = \collect($submissao->desafio?->perguntas ?? [])->map(function ($pergunta) {
                        return [
                            'id' => (int) $pergunta->id,
                            'pivot' => [
                                'valor_pontuacao' => (int) ($pergunta->pivot->pontuacao_extra ?? 1),
                            ],
                        ];
                    })->values()->all();

                    $respostas = \collect($submissao->respostas ?? [])->map(function ($resposta) {
                        return [
                            'id' => (int) $resposta->id,
                            'id_pergunta' => (int) $resposta->id_pergunta,
                            'ids_opcoes_escolhidas' => $resposta->ids_opcoes_escolhidas,
                            'resposta_texto' => $resposta->resposta_texto,
                            'status_correcao' => $resposta->correta === null
                                ? 'Por_Avaliar'
                                : ($resposta->correta ? 'Correto' : 'Errado'),
                            'pontuacao_obtida' => (int) ($resposta->pontuacao ?? 0),
                            'comentario_formador' => null,
                            'pergunta' => $resposta->pergunta,
                            'opcao_escolhida' => null,
                        ];
                    })->values()->all();

                    return [
                        'id' => (int) $submissao->id,
                        'estado' => $submissao->estado === 'Avaliado'
                            ? 'Corrigido'
                            : ($submissao->estado === 'Submetido' ? 'Aguardando_Correcao' : $submissao->estado),
                        'nota_final' => $submissao->nota,
                        'corrigido_em' => $submissao->updated_at,
                        'publicado_em' => $submissao->estado === 'Avaliado' ? $submissao->updated_at : null,
                        'corrigido_por' => [
                            'id' => (int) $user->id,
                            'name' => (string) $user->name,
                        ],
                        'aluno' => $submissao->aluno,
                        'teste' => [
                            'id' => (int) ($submissao->desafio?->id ?? 0),
                            'titulo' => (string) ($submissao->desafio?->titulo ?? 'Desafio'),
                            'perguntas' => $perguntas,
                        ],
                        'respostas' => $respostas,
                    ];
                });

            $trabalhosPendentes = SubmissaoDesafioAluno::whereHas('desafio', fn($query) => $query->where('id_formador', $user->id))
                ->where('estado', '=', 'Submetido', 'and')
                ->count();
        }

        $initialSubmissaoId = $request->filled('submissao_id') ? (int) $request->query('submissao_id') : null;
        $initialDesafioModalId = $request->filled('desafio_modal_id') ? (int) $request->query('desafio_modal_id') : null;
        $initialView = (string) $request->query('view', 'dashboard');
        $allowedViews = [
            'dashboard',
            'utilizadores',
            'turmas',
            'minhas-turmas',
            'disciplinas',
            'categorias',
            'perfil',
            'definicoes',
            'testes',
            'tarefas',
            'trabalhos',
            'desafios',
            'avaliacoes',
            'boletim',
            'leaderboard',
            'notificacoes',
        ];

        if (!in_array($initialView, $allowedViews, true)) {
            $initialView = 'dashboard';
        }

        $topXp = $gamificationService->getTopXp(10);
        $topNivel = $gamificationService->getTopNivel(10);
        $topBadges = $gamificationService->getTopBadgesPontuacao(10);

        $podio = $topXp->take(3)->map(function ($userXp, $index) {
            return [
                'posicao' => $index + 1,
                'usuario' => $userXp->usuario,
                'xp_total' => $userXp->xp_total,
                'nivel' => $userXp->nivel_atual,
            ];
        });

        $rankingXp = $topXp->map(function ($userXp, $index) {
            return [
                'posicao' => $index + 1,
                'usuario' => $userXp->usuario,
                'xp_total' => $userXp->xp_total,
                'nivel' => $userXp->nivel_atual,
            ];
        });

        $rankingBadges = $topBadges->map(function ($row, $index) {
            $usuario = User::find($row->id);
            return [
                'posicao' => $index + 1,
                'usuario' => $usuario,
                'total_badges' => $row->total_badges,
                'badge_score' => $row->badge_score,
            ];
        });

        $rankingNivel = $topNivel->map(function ($userXp, $index) {
            return [
                'posicao' => $index + 1,
                'usuario' => $userXp->usuario,
                'nivel' => $userXp->nivel_atual,
                'xp_total' => $userXp->xp_total,
            ];
        });

        // 5. Renderização Final
        return Inertia::render('Dashboard/Dashboard', [
            'initialView' => $initialView,
            'initialSubmissaoId' => $initialSubmissaoId,
            'initialDesafioModalId' => $initialDesafioModalId,
            'userRoleReal' => $cargoReal,
            'estatisticas' => $estatisticas,
            'utilizadores' => User::with(['turma', 'turmasLecionadas'])->orderBy('created_at', 'desc')->get(),
            'turmas' => $turmas,
            'disciplinas' => $disciplinas,
            'categorias' => $categorias,
            'tarefasAluno' => $tarefasAluno,
            'submissoesAluno' => $submissoesAluno,
            'desafiosAluno' => $desafiosAluno,
            'inscricoesDesafiosAluno' => $inscricoesDesafiosAluno,

            // Variáveis específicas do Professor
            'perguntasProfessor' => $perguntasProfessor,
            'perguntasBancoProfessor' => $perguntasBancoProfessor,
            'perguntasBancoFiltros' => $cargoReal === 'professor'
                ? [
                    'categoria' => (string) $request->query('perguntas_categoria', ''),
                    'q' => (string) $request->query('perguntas_q', ''),
                    'minhas' => (string) $request->query('perguntas_minhas', '1'),
                ]
                : null,

            'testesProfessor' => $cargoReal === 'professor'
                ? (function () use ($user) {
                    $query = Desafio::with(['perguntas'])
                        ->where('id_formador', $user->id)
                        ->orderBy('created_at', 'desc');

                    return $query->get()->map(function (Desafio $desafio) {
                        $perguntas = \collect($desafio->perguntas ?? [])->map(function ($pergunta) {
                            $pergunta->pivot->valor_pontuacao = (int) ($pergunta->pivot->pontuacao_extra ?? 1);
                            return $pergunta;
                        });

                        return [
                            'id' => (int) $desafio->id,
                            'titulo' => (string) $desafio->titulo,
                            'instrucoes' => (string) ($desafio->descricao ?? ''),
                            'peso_avaliacao' => (float) ($desafio->peso_nota ?? 0),
                            'duracao_minutos' => $desafio->duracao_minutos,
                            'perguntas' => $perguntas,
                            'desafio_associado' => [
                                'tipo_desafio' => $desafio->tipo_desafio ?? 'Quiz',
                            ],
                        ];
                    })->values();
                })()
                : [],

            'tarefasProfessor' => $cargoReal === 'professor'
                ? AtribuicaoDesafio::with(['desafio', 'turma'])
                    ->whereHas('desafio', fn($q) => $q->where('id_formador', $user->id))
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(fn(AtribuicaoDesafio $atribuicao) => [
                        'id' => (int) $atribuicao->id,
                        'id_desafio' => (int) $atribuicao->id_desafio,
                        'data_hora_abertura' => $atribuicao->data_inicio_tentativas,
                        'data_hora_fecho' => $atribuicao->data_fim_tentativas,
                        'tentativas_maximas' => $atribuicao->tentativas_maximas,
                        'sem_consulta' => (bool) ($atribuicao->sem_consulta ?? false),
                        'created_at' => $atribuicao->created_at,
                        'turma' => $atribuicao->turma,
                        'teste' => [
                            'id' => (int) ($atribuicao->desafio?->id ?? 0),
                            'titulo' => (string) ($atribuicao->desafio?->titulo ?? 'Desafio'),
                        ],
                    ])
                    : [],
            'correcoesProfessor' => $correcoesProfessor,
            'trabalhosPendentes' => $trabalhosPendentes,
            'podio' => $podio,
            'ranking_xp' => $rankingXp,
            'ranking_nivel' => $rankingNivel,
            'ranking_badges' => $rankingBadges,
            'notificacoesData' => in_array($cargoReal, ['aluno', 'professor'])
                ? Notificacao::where('id_utilizador', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->paginate(10, ['*'], 'notif_page')
                    ->withQueryString()
                : null,
        ]);


    }
    private function tryCatchCount($table)
    {
        try {
            return DB::table($table)->count();
        } catch (\Exception $e) {
            return 0;
        }
    }
}
