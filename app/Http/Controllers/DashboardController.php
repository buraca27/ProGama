<?php

namespace App\Http\Controllers;

use App\Models\Turma;
use App\Models\User;
use App\Models\Pergunta;
use App\Models\Teste;
use App\Models\TesteAtribuicao;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $estatisticas = [
            'total_users' => DB::table('users')->count(),
            'total_turmas' => $this->tryCatchCount('turmas'),
            'total_desafios' => $this->tryCatchCount('desafios'),
        ];

        $roleMap = [1 => 'admin', 2 => 'professor', 3 => 'aluno'];
        $cargoReal = $roleMap[$user->id_role] ?? 'aluno';

        $turmas = match ($user->id_role) {
            1 => Turma::with(['professores', 'alunos'])->get(),
            2 => User::find($user->id)->turmasLecionadas()->with(['alunos', 'professores'])->get(),
            3 => $user->id_turma ? Turma::where('id', $user->id_turma)->with(['professores', 'alunos'])->get() : [],
            default => [],
        };

        return Inertia::render('Dashboard/Dashboard', [
            'userRoleReal' => $cargoReal,
            'estatisticas' => $estatisticas,
            'utilizadores' => DB::table('users')->orderBy('created_at', 'desc')->get(),
            'turmas' => $turmas,
            'perguntasProfessor' => $cargoReal === 'professor'
                ? Pergunta::with('opcoes')
                    ->orderBy('created_at', 'desc')
                    ->get()
                : [],
            'testesProfessor' => $cargoReal === 'professor'
                ? Teste::with('perguntas')
                    ->where('id_formador', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->get()
                : [],
            'tarefasProfessor' => $cargoReal === 'professor'
                ? TesteAtribuicao::with(['teste', 'turma'])
                    ->whereHas('teste', fn ($q) => $q->where('id_formador', $user->id))
                    ->orderBy('created_at', 'desc')
                    ->get()
                : [],
            'categorias' => Categoria::orderBy('nome')->get(),
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
