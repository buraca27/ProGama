<?php

namespace App\Http\Controllers;

use App\Models\Turma;
use App\Models\Disciplina;
use App\Models\Desafio;
use App\Models\Categoria;
use App\Models\AtribuicaoDesafio;
use App\Models\Badge;
use App\Models\SubmissaoDesafioAluno;
use App\Models\User;
use App\Models\Notificacao;
use App\Models\Pergunta;
use App\Models\UserXp;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
        $notasAluno = [];

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
            2 => Turma::where(function ($query) use ($user) {
                $query->whereHas('professores', fn($q) => $q->where('users.id', (int) $user->id))
                    ->orWhereHas('disciplinas.professores', fn($q) => $q->where('users.id', (int) $user->id));
            }, null, null, 'and')
                ->with(['alunos', 'professores'])
                ->orderBy('nome')
                ->get(),
            3 => $user->id_turma ? Turma::where('id', '=', $user->id_turma, 'and')->with(['professores', 'alunos'])->get() : [],
            default => [],
        };

        $disciplinas = match ($user->id_role) {
            2 => Disciplina::with(['professores', 'turmas'])
                ->whereHas('professores', fn($query) => $query->where('users.id', (int) $user->id))
                ->get(),
            3 => $user->id_turma
                ? (Turma::find((int) $user->id_turma, ['*'])?->disciplinas()
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
                $submissoesAluno = SubmissaoDesafioAluno::with(['respostas', 'desafio'])
                    ->where('id_aluno', (int) $user->id)
                    ->whereIn('id_desafio', $idsDesafiosAtribuidos->all())
                    ->orderByDesc('created_at')
                    ->get()
                    ->map(function (SubmissaoDesafioAluno $submissao) {
                        $xpGanho = ($submissao->nota !== null && $submissao->desafio)
                            ? $submissao->desafio->calcularXpParaNota((float) $submissao->nota)
                            : null;

                        return [
                            'id' => (int) $submissao->id,
                            'id_desafio' => (int) $submissao->id_desafio,
                            'estado' => (string) $submissao->estado,
                            'nota' => $submissao->nota !== null ? (float) $submissao->nota : null,
                            'xp_ganho' => $xpGanho,
                            'feedback_professor' => $submissao->feedback_professor,
                            'data_ultima_tentativa' => $submissao->data_submissao ?? $submissao->updated_at,
                            'respostas' => collect($submissao->respostas ?? [])->map(function ($resposta) {
                                $idsOpcoes = is_array($resposta->ids_opcoes_escolhidas ?? null)
                                    ? $resposta->ids_opcoes_escolhidas
                                    : [];

                                return [
                                    'id' => (int) $resposta->id,
                                    'id_pergunta' => (int) ($resposta->id_pergunta ?? 0),
                                    'id_opcao_escolhida' => $resposta->id_opcao_escolhida
                                        ?? ($idsOpcoes[0] ?? null),
                                    'ids_opcoes_escolhidas' => $idsOpcoes,
                                    'resposta_texto' => $resposta->resposta_texto,
                                    'status_correcao' => $resposta->status_correcao ?? 'Por_Avaliar',
                                    'pontuacao_obtida' => (int) ($resposta->pontuacao_obtida ?? 0),
                                    'comentario_formador' => $resposta->comentario_formador,
                                ];
                            })->values()->all(),
                        ];
                    })
                    ->values()
                    ->all();
            }

            // Load badge details for all desafios in one query
            $allBadgeIds = $tarefasAluno
                ->map(fn($a) => $a->desafio?->getBadgeIds() ?? [])
                ->flatten()
                ->unique()
                ->filter()
                ->values();

            $badgeModels = $allBadgeIds->isNotEmpty()
                ? Badge::whereIn('id', $allBadgeIds->all())
                    ->get()
                    ->keyBy('id')
                : collect();

            $desafiosAluno = $tarefasAluno->map(function ($atribuicao) use ($badgeModels) {
                $arr = $atribuicao->toArray();
                $badgeIds = $atribuicao->desafio?->getBadgeIds() ?? [];
                $arr['desafio']['badges_detalhes'] = collect($badgeIds)
                    ->map(fn($id) => $badgeModels->get($id))
                    ->filter()
                    ->map(fn($b) => [
                        'id'        => (int) $b->id,
                        'nome'      => $b->nome,
                        'icone_url' => $b->icone_url,
                        'raridade'  => $b->raridade,
                    ])
                    ->values()
                    ->all();
                return $arr;
            })->values()->all();

            $inscricoesDesafiosAluno = $submissoesAluno;

            $notasAluno = SubmissaoDesafioAluno::with(['desafio.disciplina'])
                ->where('id_aluno', (int) $user->id)
                ->whereIn('estado', [SubmissaoDesafioAluno::AVALIADO, SubmissaoDesafioAluno::CONCLUIDO])
                ->whereNotNull('nota')
                ->orderByDesc('data_submissao')
                ->orderByDesc('updated_at')
                ->get()
                ->map(function (SubmissaoDesafioAluno $submissao) {
                    return [
                        'id' => (int) $submissao->id,
                        'valor' => (float) ($submissao->nota ?? 0),
                        'created_at' => $submissao->data_submissao ?? $submissao->updated_at,
                        'teste' => [
                            'titulo' => (string) ($submissao->desafio?->titulo ?? 'Desafio'),
                            'peso_avaliacao' => (float) ($submissao->desafio?->peso_nota ?? 0),
                            'tipo_desafio' => (string) ($submissao->desafio?->tipo_desafio ?? 'Tarefa'),
                            'disciplina' => [
                                'nome' => (string) ($submissao->desafio?->disciplina?->nome ?? 'Geral'),
                            ],
                        ],
                    ];
                })
                ->values()
                ->all();
        }

        $perguntasProfessor = [];
        $perguntasBancoProfessor = null;
        $trabalhosPendentes = 0;
        $badgesProfessor = [];

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

            // Quando navegamos de uma notificação, garantir que a página certa é carregada
            if ($request->filled('submissao_id') && !$request->has('correcoes_page')) {
                $targetId = (int) $request->query('submissao_id');
                $targetSub = SubmissaoDesafioAluno::select('id', 'estado', 'created_at')
                    ->whereHas('desafio', fn($q) => $q->where('id_formador', $user->id))
                    ->find($targetId);

                if ($targetSub) {
                    $estadoOrder = match ($targetSub->estado) {
                        'Submetido'    => 0,
                        'Em_Resolucao' => 1,
                        default        => 2,
                    };
                    $posicao = SubmissaoDesafioAluno::whereHas('desafio', fn($q) => $q->where('id_formador', $user->id))
                        ->where(function ($q) use ($estadoOrder, $targetSub) {
                            $q->whereRaw("CASE WHEN estado = 'Submetido' THEN 0 WHEN estado = 'Em_Resolucao' THEN 1 ELSE 2 END < ?", [$estadoOrder])
                              ->orWhere(function ($q2) use ($estadoOrder, $targetSub) {
                                  $q2->whereRaw("CASE WHEN estado = 'Submetido' THEN 0 WHEN estado = 'Em_Resolucao' THEN 1 ELSE 2 END = ?", [$estadoOrder])
                                     ->where('created_at', '>', $targetSub->created_at);
                              });
                        })
                        ->count();
                    $request->merge(['correcoes_page' => (int) floor($posicao / 10) + 1]);
                }
            }

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
                ->through(function (SubmissaoDesafioAluno $inscricao) use ($user) {
                    $perguntas = \collect($inscricao->desafio?->perguntas ?? [])->map(function ($pergunta) {
                        return [
                            'id' => (int) $pergunta->id,
                            'pivot' => [
                                'valor_pontuacao' => (int) ($pergunta->pivot->pontuacao_extra ?? 1),
                            ],
                        ];
                    })->values()->all();

                    $respostas = \collect($inscricao->respostas ?? [])->map(function ($resposta) {
                        return [
                            'id' => (int) $resposta->id,
                            'id_pergunta' => (int) $resposta->id_pergunta,
                            'ids_opcoes_escolhidas' => $resposta->ids_opcoes_escolhidas,
                            'resposta_texto' => $resposta->resposta_texto,
                            'status_correcao' => $resposta->status_correcao ?? 'Por_Avaliar',
                            'pontuacao_obtida' => (int) ($resposta->pontuacao_obtida ?? 0),
                            'comentario_formador' => $resposta->comentario_formador,
                            'pergunta' => $resposta->pergunta,
                            'opcao_escolhida' => null,
                        ];
                    })->values()->all();

                    $metadata = $inscricao->metadata ?? [];
                    $ficheiroCaminho = $metadata['ficheiro'] ?? null;

                    return [
                        'id' => (int) $inscricao->id,
                        'estado' => $inscricao->estado === 'Concluido'
                            ? 'Corrigido'
                            : ($inscricao->estado === 'Submetido' ? 'Aguardando_Correcao' : $inscricao->estado),
                        'nota_final' => $inscricao->nota !== null ? (float) $inscricao->nota : null,
                        'feedback_professor' => $inscricao->feedback_professor,
                        'corrigido_em' => $inscricao->updated_at,
                        'publicado_em' => $inscricao->estado === 'Concluido' ? $inscricao->updated_at : null,
                        'corrigido_por' => [
                            'id' => (int) $user->id,
                            'name' => (string) $user->name,
                        ],
                        'aluno' => $inscricao->aluno,
                        'teste' => [
                            'id' => (int) ($inscricao->desafio?->id ?? 0),
                            'titulo' => (string) ($inscricao->desafio?->titulo ?? 'Desafio'),
                            'tipo_desafio' => (string) ($inscricao->desafio?->tipo_desafio ?? 'Quiz'),
                            'perguntas' => $perguntas,
                        ],
                        'respostas' => $respostas,
                        'submissao_ficheiro_url' => $ficheiroCaminho
                            ? '/storage/' . $ficheiroCaminho
                            : null,
                        'submissao_ficheiro_nome' => $ficheiroCaminho ? basename($ficheiroCaminho) : null,
                        'submissao_link' => $metadata['link_submissao'] ?? null,
                        'submissao_mensagem' => $metadata['mensagem_submissao'] ?? null,
                    ];
                });

            $trabalhosPendentes = SubmissaoDesafioAluno::whereHas('desafio', fn($query) => $query->where('id_formador', $user->id))
                ->where('estado', '=', 'Submetido')
                ->count();

            $badgesProfessor = Badge::query()
                ->where('ativa', true)
                ->orderBy('nome')
                ->get()
                ->map(fn(Badge $badge) => [
                    'id'         => (int) $badge->id,
                    'nome'       => (string) $badge->nome,
                    'descricao'  => (string) ($badge->descricao ?? ''),
                    'imagem_url' => $badge->imagem_url ?? $badge->icone_url ?? null,
                    'raridade'   => (int) $badge->raridade,
                ])
                ->values();
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
            'social',
            'updateLandingPage',
        ];

        if (!in_array($initialView, $allowedViews, true)) {
            $initialView = 'dashboard';
        }

        $topXp = $gamificationService->getTopXp(10);
        $topNivel = $gamificationService->getTopNivel(10);
        $topBadges = $gamificationService->getTopBadgesPontuacao(10);

        $mapRow = fn($row) => ['id' => $row->id, 'name' => $row->name, 'foto_perfil' => $row->foto_perfil ?? null];

        $podio = $topXp->take(3)->map(function ($row, $index) use ($mapRow) {
            return [
                'posicao'  => $index + 1,
                'usuario'  => $mapRow($row),
                'xp_total' => (int) $row->xp_total,
                'nivel'    => (int) $row->nivel_atual,
            ];
        });

        $rankingXp = $topXp->map(function ($row, $index) use ($mapRow) {
            return [
                'posicao'  => $index + 1,
                'usuario'  => $mapRow($row),
                'xp_total' => (int) $row->xp_total,
                'nivel'    => (int) $row->nivel_atual,
            ];
        });

        $rankingBadges = $topBadges->map(function ($row, $index) {
            return [
                'posicao'      => $index + 1,
                'usuario'      => ['id' => $row->id, 'name' => $row->name, 'foto_perfil' => $row->foto_perfil ?? null],
                'nivel'        => (int) ($row->nivel_atual ?? 1),
                'total_badges' => (int) $row->total_badges,
                'badge_score'  => (int) $row->badge_score,
            ];
        });

        $rankingNivel = $topNivel->map(function ($row, $index) use ($mapRow) {
            return [
                'posicao'  => $index + 1,
                'usuario'  => $mapRow($row),
                'nivel'    => (int) $row->nivel_atual,
                'xp_total' => (int) $row->xp_total,
            ];
        });

        // 5. Renderização Final
        return Inertia::render('Dashboard/Dashboard', [
            'initialView' => $initialView,
            'initialSubmissaoId' => $initialSubmissaoId,
            'initialDesafioModalId' => $initialDesafioModalId,
            'landingConteudo' => \App\Models\LandingPageContent::first()?->conteudo ?? [],
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
            'notasAluno' => $notasAluno,

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
                            'xp_base' => (int) ($desafio->xp_base ?? 1),
                            'auto_award_xp' => (bool) ($desafio->auto_award_xp ?? true),
                            'badges_json' => $desafio->badges_json,
                            'url_anexo_global' => $desafio->url_anexo_global,
                            'anexos_professor_json' => $desafio->anexos_professor_json,
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
            'badgesProfessor' => $badgesProfessor,
            'podio' => $podio,
            'ranking_xp' => $rankingXp,
            'ranking_nivel' => $rankingNivel,
            'ranking_badges' => $rankingBadges,
            'minhaPosicao' => (function() use ($user) {
                // Apenas alunos têm posição no leaderboard
                if ((int) $user->id_role !== 3) return null;

                $myXp    = $user->getXpTotal();
                $myNivel = $user->getNivelAtual();

                // Conta apenas entre alunos (id_role = 3)
                $posXp = DB::table('users')
                    ->leftJoin('User_XP as ux', 'users.id', '=', 'ux.id_usuario')
                    ->where('users.id_role', 3)
                    ->where(DB::raw('COALESCE(ux.xp_total, 0)'), '>', $myXp)
                    ->count() + 1;

                $posNivel = DB::table('users')
                    ->leftJoin('User_XP as ux', 'users.id', '=', 'ux.id_usuario')
                    ->where('users.id_role', 3)
                    ->where(function ($q) use ($myNivel, $myXp) {
                        $q->where(DB::raw('COALESCE(ux.nivel_atual, 1)'), '>', $myNivel)
                          ->orWhere(function ($q2) use ($myNivel, $myXp) {
                              $q2->where(DB::raw('COALESCE(ux.nivel_atual, 1)'), $myNivel)
                                 ->where(DB::raw('COALESCE(ux.xp_total, 0)'), '>', $myXp);
                          });
                    })
                    ->count() + 1;

                $myBadgeScore = DB::select("
                    SELECT COALESCE(SUM(CASE
                        WHEN b.raridade = 4 THEN 20
                        WHEN b.raridade = 3 THEN 10
                        WHEN b.raridade = 2 THEN 5
                        WHEN b.raridade = 1 THEN 3
                        ELSE 1 END), 0) as score
                    FROM Inventario_Badges ib LEFT JOIN Badges b ON ib.id_badge = b.id
                    WHERE ib.id_utilizador = ?
                ", [$user->id])[0]->score ?? 0;

                $posBadges = DB::select("
                    SELECT COUNT(*) + 1 as posicao FROM (
                        SELECT ib.id_utilizador, COALESCE(SUM(CASE
                            WHEN b.raridade = 4 THEN 20
                            WHEN b.raridade = 3 THEN 10
                            WHEN b.raridade = 2 THEN 5
                            WHEN b.raridade = 1 THEN 3
                            ELSE 1 END), 0) as badge_score
                        FROM Inventario_Badges ib
                        JOIN users u ON ib.id_utilizador = u.id
                        LEFT JOIN Badges b ON ib.id_badge = b.id
                        WHERE u.id_role = 3
                        GROUP BY ib.id_utilizador HAVING badge_score > ?
                    ) sub
                ", [$myBadgeScore])[0]->posicao ?? 1;

                return [
                    'xp'           => $posXp,
                    'nivel'        => $posNivel,
                    'badges'       => $posBadges,
                    'xp_total'     => $myXp,
                    'nivel_atual'  => $myNivel,
                    'badge_score'  => $myBadgeScore,
                    'total_badges' => $user->getContagemBadges(),
                ];
            })(),
            'socialData' => (function () use ($user, $request) {
                    $seguindoIds        = $user->seguindo()->pluck('users.id')->toArray();
                    $pendingSentIds     = $user->solicitacoesEnviadas()->where('estado', 'pendente')->pluck('id_destinatario')->toArray();
                    $pendingReceivedIds = $user->solicitacoesRecebidas()->where('estado', 'pendente')->pluck('id_solicitante')->toArray();

                    $socialStats = [
                        'seguidores' => $user->seguidores()->count(),
                        'seguindo'   => $user->seguindo()->count(),
                        'conexoes'   => $user->seguindo()
                            ->whereIn('users.id', $user->seguidores()->pluck('users.id'))
                            ->count(),
                    ];

                    // Mapeia utilizador para array — esconde XP/badges para não-alunos
                    $mapUser = fn(User $u, array $extra = []) => array_merge([
                        'id'               => $u->id,
                        'name'             => $u->name,
                        'foto_perfil'      => $u->foto_perfil,
                        'id_role'          => (int) $u->id_role,
                        'id_turma'         => $u->id_turma,
                        'nivel'            => (int) $u->id_role === 3 ? $u->getNivelAtual() : null,
                        'xp_total'         => (int) $u->id_role === 3 ? $u->getXpTotal() : null,
                        'badges_count'     => (int) $u->id_role === 3 ? ($u->badges_count ?? 0) : null,
                        'seguidores_count' => $u->seguidores_count ?? 0,
                    ], $extra);

                    // Aplica filtro de papel/turma ao query builder
                    $filterKey = $request->string('social_filter')->toString();
                    $applyFilter = function ($q) use ($filterKey, $user) {
                        if ($filterKey === 'professores') {
                            $q->where('id_role', 2);
                        } elseif ($filterKey === 'secretaria') {
                            $q->where('id_role', 1);
                        } elseif ($filterKey === 'alunos') {
                            $q->where('id_role', 3);
                        } elseif ($filterKey === 'turma') {
                            if ((int) $user->id_role === 3 && $user->id_turma) {
                                $q->where('id_turma', $user->id_turma)->where('id_role', 3);
                            } elseif ((int) $user->id_role === 2) {
                                $turmaIds = $user->turmasLecionadas()->pluck('Turmas.id')->toArray();
                                $q->whereIn('id_turma', $turmaIds)->where('id_role', 3);
                            }
                        }
                    };

                    $seguindo = $user->seguindo()
                        ->with('userXp')
                        ->withCount(['seguidores', 'badges'])
                        ->get()
                        ->map(fn(User $u) => $mapUser($u));

                    $pedidosPendentes = User::query()
                        ->whereIn('id', $pendingReceivedIds)
                        ->with('userXp')
                        ->withCount(['seguidores', 'badges'])
                        ->get()
                        ->map(fn(User $u) => $mapUser($u));

                    $seguidores = $user->seguidores()
                        ->with('userXp')
                        ->withCount(['seguidores', 'badges'])
                        ->get()
                        ->map(fn(User $u) => $mapUser($u, [
                            'is_following' => in_array($u->id, $seguindoIds, true),
                        ]));

                    if ($request->filled('social_search')) {
                        $term = trim((string) $request->string('social_search'));
                        $q = User::query()
                            ->where('id', '!=', $user->id)
                            ->where('name', 'like', '%' . $term . '%')
                            ->with('userXp')
                            ->withCount(['seguidores', 'seguindo', 'badges'])
                            ->orderBy('name')
                            ->limit(20);
                        $applyFilter($q);
                        $results = $q->get()->map(fn(User $u) => $mapUser($u, [
                            'is_following'     => in_array($u->id, $seguindoIds, true),
                            'request_sent'     => in_array($u->id, $pendingSentIds, true),
                            'request_received' => in_array($u->id, $pendingReceivedIds, true),
                        ]));

                        return [
                            'sugestoes'         => $results,
                            'seguindo'          => $seguindo,
                            'seguidores'        => $seguidores,
                            'social_stats'      => $socialStats,
                            'pedidos_pendentes' => $pedidosPendentes,
                            'is_searching'      => true,
                            'active_filter'     => $filterKey,
                        ];
                    }

                    $q = User::query()
                        ->where('id', '!=', $user->id)
                        ->whereNotIn('id', $seguindoIds)
                        ->whereNotIn('id', $pendingSentIds)
                        ->whereNotIn('id', $pendingReceivedIds)
                        ->with('userXp')
                        ->withCount(['seguidores', 'seguindo', 'badges'])
                        ->orderByDesc('id')
                        ->limit(20);
                    $applyFilter($q);
                    $sugestoes = $q->get()->map(fn(User $u) => $mapUser($u, [
                        'request_sent'     => in_array($u->id, $pendingSentIds, true),
                        'request_received' => in_array($u->id, $pendingReceivedIds, true),
                    ]));

                    return [
                        'sugestoes'         => $sugestoes,
                        'seguindo'          => $seguindo,
                        'seguidores'        => $seguidores,
                        'social_stats'      => $socialStats,
                        'pedidos_pendentes' => $pedidosPendentes,
                        'is_searching'      => false,
                        'active_filter'     => $filterKey,
                    ];
                })(),
            'notificacoesData' => in_array($cargoReal, ['aluno', 'professor'])
                ? (function () use ($request, $user) {
                    $tiposPermitidos = ['Novo_Desafio', 'Desafio_Corrigido', 'Teste_Corrigido', 'XP_Recebido', 'Novo_Nivel', 'Badge_Ganho', 'Submissao_Aluno', 'Alerta_Integridade', 'Alteracao_Datas', 'Pedido_Conexao', 'Conexao_Aceite', 'Conexao_Recusada'];
                    $tipo  = in_array($request->query('notif_tipo'), $tiposPermitidos, true) ? $request->query('notif_tipo') : null;
                    $ordem = $request->query('notif_ordem') === 'asc' ? 'asc' : 'desc';
                    $query = Notificacao::where('id_utilizador', $user->id);
                    if ($tipo !== null) {
                        $query->where('tipo_notificacao', $tipo);
                    }
                    return $query->orderBy('created_at', $ordem)->paginate(10, ['*'], 'notif_page')->withQueryString();
                })()
                : null,
            'notifFiltros' => ['tipo' => $request->query('notif_tipo'), 'ordem' => $request->query('notif_ordem', 'desc')],
            'perfilPublicoData' => $request->filled('perfil_publico_id')
                ? (function () use ($request, $user) {
                    $alvo = User::find($request->integer('perfil_publico_id'));
                    if (!$alvo) return null;
                    $alvOEAluno = (int) $alvo->id_role === 3;
                    return [
                        'usuario'          => ['id' => $alvo->id, 'name' => $alvo->name, 'foto_perfil' => $alvo->foto_perfil, 'id_role' => (int) $alvo->id_role],
                        'isAluno'          => $alvOEAluno,
                        'xpTotal'          => $alvOEAluno ? $alvo->getXpTotal() : null,
                        'nivelAtual'       => $alvOEAluno ? $alvo->getNivelAtual() : null,
                        'percentagemNivel' => $alvOEAluno ? $alvo->getPercentagemNivel() : null,
                        'xpProxNivel'      => $alvOEAluno ? $alvo->getXpProximoNivel() : null,
                        'contagemBadges'   => $alvOEAluno ? $alvo->getContagemBadges() : 0,
                        'badges'           => $alvOEAluno
                            ? Badge::join('Inventario_Badges', 'Badges.id', '=', 'Inventario_Badges.id_badge')
                                ->where('Inventario_Badges.id_utilizador', $alvo->id)
                                ->select('Badges.id', 'Badges.nome', 'Badges.raridade', 'Badges.descricao', 'Badges.icone_url', 'Inventario_Badges.data_obtencao')
                                ->limit(12)
                                ->get()
                                ->map(fn($b) => [
                                    'id'       => $b->id,
                                    'nome'     => $b->nome,
                                    'raridade' => $b->raridade,
                                    'descricao' => $b->descricao,
                                    'icone_url' => $b->icone_url,
                                    'pivot'    => ['data_obtencao' => $b->data_obtencao],
                                ])
                                ->values()
                            : [],
                        'social'           => [
                            'seguidores'       => $alvo->seguidores()->count(),
                            'seguindo'         => $alvo->seguindo()->count(),
                            'is_self'          => $user->id === $alvo->id,
                            'is_connected'     => $user->isConectadoCom($alvo->id),
                            'request_sent'     => $user->hasSolicitacaoPendentePara($alvo->id),
                            'request_received' => $user->hasSolicitacaoPendenteDe($alvo->id),
                        ],
                    ];
                })()
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
