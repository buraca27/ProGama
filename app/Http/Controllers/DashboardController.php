<?php

namespace App\Http\Controllers;

use App\Models\Turma;
use App\Models\Disciplina;
use App\Models\Categoria;
use App\Models\User;
use App\Models\Pergunta;
use App\Models\Teste;
use App\Models\TesteAtribuicao;
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
            2 => User::find($user->id)->turmasLecionadas()->with(['alunos', 'professores'])->get(),
            3 => $user->id_turma ? Turma::where('id', $user->id_turma)->with(['professores', 'alunos'])->get() : [],
            default => [],
        };

        $disciplinas = Disciplina::with(['professores', 'turmas'])->get();
        $categorias = Categoria::withCount(['desafios', 'testes'])->orderBy('nome')->get();

        // 4. Lógica para Tarefas do Aluno
        $tarefasAluno = [];
        if ($cargoReal === 'aluno' && $user->id_turma) {
            $tarefasAluno = TesteAtribuicao::with(['teste'])
                ->where('id_turma', $user->id_turma)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        $perguntasProfessor = [];
        $perguntasBancoProfessor = null;

        if ($cargoReal === 'professor') {
            $perguntasProfessor = Pergunta::orderBy('created_at', 'desc')
                ->get(['id', 'texto', 'tipo_pergunta', 'id_categoria', 'url_anexo_pergunta']);

            $perguntasBancoProfessorQuery = Pergunta::with('opcoes')
                ->orderBy('created_at', 'desc');

            if ($request->filled('perguntas_categoria')) {
                $perguntasBancoProfessorQuery->where(
                    'id_categoria',
                    (int) $request->string('perguntas_categoria'),
                );
            }

            if ($request->filled('perguntas_q')) {
                $textoPesquisa = trim((string) $request->string('perguntas_q'));
                $perguntasBancoProfessorQuery->where('texto', 'like', '%' . $textoPesquisa . '%');
            }

            $perguntasBancoProfessor = $perguntasBancoProfessorQuery
                ->paginate(8, ['*'], 'perguntas_page')
                ->withQueryString();
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

            // Variáveis específicas do Professor
            'perguntasProfessor' => $perguntasProfessor,
            'perguntasBancoProfessor' => $perguntasBancoProfessor,
            'perguntasBancoFiltros' => $cargoReal === 'professor'
                ? [
                    'categoria' => (string) $request->query('perguntas_categoria', ''),
                    'q' => (string) $request->query('perguntas_q', ''),
                ]
                : null,

            'testesProfessor' => $cargoReal === 'professor'
                ? Teste::with('perguntas')->where('id_formador', $user->id)->orderBy('created_at', 'desc')->get() : [],

            'tarefasProfessor' => $cargoReal === 'professor'
                ? TesteAtribuicao::with(['teste', 'turma'])
                    ->whereHas('teste', fn($q) => $q->where('id_formador', $user->id))
                    ->orderBy('created_at', 'desc')->get() : [],
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
