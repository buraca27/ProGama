<?php

namespace App\Http\Controllers;

use App\Models\Turma;
use App\Models\Disciplina;
use App\Models\Categoria;
use App\Models\User;
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
            'total_disciplinas' => $this->tryCatchCount('disciplinas'),
        ];

        $roleMap = [1 => 'admin', 2 => 'professor', 3 => 'aluno'];
        $cargoReal = $roleMap[$user->id_role] ?? 'aluno';

        $turmas = match ($user->id_role) {
            1 => Turma::with(['professores', 'alunos'])->get(),
            2 => User::find($user->id)->turmasLecionadas()->with(['alunos', 'professores'])->get(),
            3 => $user->id_turma ? Turma::where('id', $user->id_turma)->with(['professores', 'alunos'])->get() : [],
            default => [],
        };
        $disciplinas = Disciplina::with(['professores', 'turmas'])->get();
        $categorias  = Categoria::withCount(['desafios', 'testes'])->get();

        return Inertia::render('Dashboard/Dashboard', [
            'userRoleReal' => $cargoReal,
            'estatisticas' => $estatisticas,
            'utilizadores' => User::with(['turma', 'turmasLecionadas'])->orderBy('created_at', 'desc')->get(),
            'turmas' => $turmas,
            'disciplinas' => $disciplinas,
            'categorias' => $categorias,
        ]);
    }
    public function store(Request $request)
        {
            $request->validate([
                'nome' => 'required|string|max:100|unique:Disciplinas,nome',
                'codigo' => 'nullable|string|max:20|unique:Disciplinas,codigo',
                'descricao' => 'nullable|string',
            ]);

            Disciplina::create([
                'nome' => $request->nome,
                'codigo' => $request->codigo,
                'descricao' => $request->descricao,
            ]);

            return back()->with('success', 'Disciplina criada com sucesso!');
        }

        public function update(Request $request, $id)
        {
            $request->validate([
                'nome' => 'required|string|max:100|unique:Disciplinas,nome,' . $id,
                'codigo' => 'nullable|string|max:20|unique:Disciplinas,codigo,' . $id,
                'descricao' => 'nullable|string',
            ]);

            $disciplina = Disciplina::findOrFail($id);
            $disciplina->update([
                'nome' => $request->nome,
                'codigo' => $request->codigo,
                'descricao' => $request->descricao,
            ]);

            return back()->with('success', 'Disciplina atualizada com sucesso!');
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