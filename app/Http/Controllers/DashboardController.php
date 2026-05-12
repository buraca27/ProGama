<?php

namespace App\Http\Controllers;

use App\Models\Turma;
use App\Models\Disciplina;
use App\Models\Categoria;
use App\Models\User;
use App\Models\Pergunta;
use App\Models\LandingPageContent;
use App\Models\Teste;
use App\Models\TesteAtribuicao;
use App\Models\TesteRealizado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $perguntasProfessor = [];
        $perguntasBancoProfessor = null;
        $correcoesProfessor = null;
        $submissoesAluno = [];

        // 1. Estatísticas Gerais
        $estatisticas = [
            'total_users' => DB::table('users')->count(),
            'total_turmas' => $this->tryCatchCount('Turmas'),
            'total_desafios' => $this->tryCatchCount('Desafios'),
            'total_disciplinas' => $this->tryCatchCount('Disciplinas'),
        ];

        // 2. Mapeamento de Cargo
        $roleMap = [1 => 'admin', 2 => 'professor', 3 => 'aluno'];
        $cargoReal = $roleMap[$user->id_role] ?? 'aluno';

        // 3. Definição das variáveis que estavam em falta (sublinhadas a vermelho)
        $turmas = match ($user->id_role) {
            1 => Turma::with(['professores', 'alunos'])->get(),
            2 => User::find($user->id, ['*'])->turmasLecionadas()->with(['alunos', 'professores'])->get(),
            3 => $user->id_turma ? Turma::where('id', '=', $user->id_turma, 'and')->with(['professores', 'alunos'])->get() : [],
            default => [],
        };

        $disciplinas = Disciplina::with(['professores', 'turmas'])->get();
        $categorias = Categoria::withCount(['desafios', 'testes'])->orderBy('nome')->get();

        // 4. Lógica para Tarefas do Aluno
        $tarefasAluno = [];
        if ($cargoReal === 'aluno') {
            $idTurmaAluno = $user->id_turma ? (int) $user->id_turma : null;

            $tarefasAluno = TesteAtribuicao::with(['teste'])
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
                ->with([
                    'teste' => fn($query) => $query->with([
                        'perguntas' => fn($perguntas) => $perguntas
                            ->with('opcoes')
                            ->withPivot('valor_pontuacao'),
                    ]),
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            $idsTestesAtribuidos = $tarefasAluno
                ->pluck('id_teste')
                ->map(fn($id) => (int) $id)
                ->unique()
                ->values();

            if ($idsTestesAtribuidos->isNotEmpty()) {
                $submissoesAluno = TesteRealizado::with([
                    'respostas:id,id_teste_realizado,id_pergunta,id_opcao_escolhida,ids_opcoes_escolhidas,resposta_texto,status_correcao,pontuacao_obtida,comentario_formador',
                ])
                    ->where('id_aluno', (int) $user->id)
                    ->whereIn('id_teste', $idsTestesAtribuidos->all())
                    ->orderByDesc('created_at')
                    ->get();
            }
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

            $correcoesProfessor = TesteRealizado::with([
                'aluno:id,name,email',
                'teste:id,titulo,id_formador',
                'teste.perguntas:id',
                'respostas.pergunta:id,texto,tipo_pergunta',
                'respostas.pergunta.opcoes:id,id_pergunta,texto_opcao,is_correct',
                'respostas.opcaoEscolhida:id,texto_opcao',
                'corrigidoPor:id,name',
            ])
                ->whereHas('teste', fn($query) => $query->where('id_formador', $user->id))
                ->orderByRaw("CASE WHEN estado = 'Aguardando_Correcao' THEN 0 WHEN estado = 'Em_Resolucao' THEN 1 ELSE 2 END")
                ->orderByDesc('created_at')
                ->paginate(10, ['*'], 'correcoes_page')
                ->withQueryString();

            $trabalhosPendentes = TesteRealizado::whereHas('teste', fn($query) => $query->where('id_formador', $user->id))
                ->where('estado', '=', 'Aguardando_Correcao', 'and')
                ->count();
        }

        // 5. Renderização Final
        return Inertia::render('Dashboard/Dashboard', [
            'userRoleReal' => $cargoReal,
            'estatisticas' => $estatisticas,
            'utilizadores' => User::with(['turma', 'turmasLecionadas'])->orderBy('created_at', 'desc')->get(),
            'turmas' => $turmas,
            'disciplinas' => $disciplinas,
            'categorias' => $categorias,
            'tarefasAluno' => $tarefasAluno,
            'submissoesAluno' => $submissoesAluno,

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
                ? Teste::with('perguntas')->where('id_formador', $user->id)->orderBy('created_at', 'desc')->get() : [],

            'tarefasProfessor' => $cargoReal === 'professor'
                ? TesteAtribuicao::with(['teste', 'turma'])
                    ->whereHas('teste', fn($q) => $q->where('id_formador', $user->id))
                    ->orderBy('created_at', 'desc')->get() : [],
            'correcoesProfessor' => $correcoesProfessor,
            'trabalhosPendentes' => $trabalhosPendentes,
            'landingConteudo'    => LandingPageContent::first()->conteudo,
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
