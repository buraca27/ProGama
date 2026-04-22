<?php

namespace App\Http\Controllers;

use App\Models\Turma;
use App\Models\User;
use Illuminate\Http\Request;

class TurmaController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:100',
            'ano_letivo' => 'required|string|max:20'
        ]);

        Turma::create($validated);
        return redirect()->route('dashboard')->with('success', 'Turma criada.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:100',
            'ano_letivo' => 'required|string|max:20'
        ]);

        Turma::findOrFail($id)->update($validated);
        return redirect()->route('dashboard')->with('success', 'Turma atualizada.');
    }

    public function destroy($id)
    {
        Turma::findOrFail($id)->delete();
        return redirect()->route('dashboard')->with('success', 'Turma apagada.');
    }

    public function assign(Request $request, $id)
    {
        $turma = Turma::findOrFail($id);

        // Limpar alunos antigos e atribuir novos
        User::where('id_turma', $turma->id)->update(['id_turma' => null]);
        if ($request->filled('alunos_ids')) {
            User::whereIn('id', $request->alunos_ids)->update(['id_turma' => $turma->id]);
        }

        // Sincronizar Professores (Many-to-Many)
        $turma->professores()->sync($request->input('professores_ids', []));

        return redirect()->route('dashboard')->with('success', 'Atribuições guardadas!');
    }
}
