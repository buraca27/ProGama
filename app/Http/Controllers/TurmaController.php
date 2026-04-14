<?php

namespace App\Http\Controllers;

use App\Models\Turma;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TurmaController extends Controller
{
    // Método para listar as turmas dependendo do ROLE
    public function index()
    {
        $user = auth()->user();

        if ($user->id_role === 1) {
            // ADMIN / SECRETARIA: Vê todas as turmas, alunos e professores
            $turmas = Turma::with(['professores', 'alunos'])->get();
        } elseif ($user->id_role === 2) {
            // PROFESSOR: Vê apenas as turmas que leciona e os alunos dessas turmas
            $turmas = $user->turmasLecionadas()->with(['alunos'])->get();
        } elseif ($user->id_role === 3) {
            // ALUNO: Vê apenas a sua turma, colegas e professores
            $turmas = Turma::where('id', $user->id_turma)->with(['professores', 'alunos'])->get();
        }

        return Inertia::render('Turmas/Index', [
            'turmas' => $turmas
        ]);
    }

    // Método para a Secretaria CRIAR a turma
    public function store(Request $request)
    {
        // Apenas admin (role 1) pode criar
        if (auth()->user()->id_role !== 1) {
            abort(403, 'Não autorizado');
        }

        $validated = $request->validate([
            'nome' => 'required|string|max:100',
            'ano_letivo' => 'required|string|max:20',
        ]);

        Turma::create($validated);

        return redirect()->back()->with('success', 'Turma criada com sucesso.');
    }

    // Método para a Secretaria ATRIBUIR professores e alunos a uma turma
    public function assignUsers(Request $request, $id)
    {
        if (auth()->user()->id_role !== 1) {
            abort(403);
        }

        $turma = Turma::findOrFail($id);

        // Atribuir Alunos (atualiza o id_turma na tabela users)
        if ($request->has('alunos_ids')) {
            User::whereIn('id', $request->alunos_ids)
                ->where('id_role', 3)
                ->update(['id_turma' => $turma->id]);
        }

        // Atribuir Professores (sincroniza a tabela pivot)
        if ($request->has('professores_ids')) {
            $turma->professores()->sync($request->professores_ids);
        }

        return redirect()->back()->with('success', 'Utilizadores atribuídos com sucesso.');
    }
}
