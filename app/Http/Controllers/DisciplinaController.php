<?php

namespace App\Http\Controllers;

use App\Models\Disciplina;
use Illuminate\Http\Request;

class DisciplinaController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nome'     => 'required|string|max:100|unique:Disciplinas,nome',
            'codigo'   => 'nullable|string|max:20|unique:Disciplinas,codigo',
            'descricao'=> 'nullable|string',
        ]);

        Disciplina::create([
            'nome'      => $request->nome,
            'codigo'    => $request->codigo ?: null,
            'descricao' => $request->descricao ?: null,
        ]);

        return back()->with('success', 'Disciplina criada com sucesso!');
    }

    public function assign(Request $request, $id)
    {
        $disciplina = Disciplina::findOrFail($id);

        $request->validate([
            'professores'   => 'nullable|array',
            'professores.*' => 'exists:users,id',
            'turmas'        => 'nullable|array',
            'turmas.*'      => 'exists:Turmas,id',
        ]);

        $disciplina->professores()->sync($request->professores ?? []);
        $disciplina->turmas()->sync($request->turmas ?? []);

        return back()->with('success', 'Associações da disciplina atualizadas com sucesso!');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nome'     => 'required|string|max:100|unique:Disciplinas,nome,' . $id,
            'codigo'   => 'nullable|string|max:20|unique:Disciplinas,codigo,' . $id,
            'descricao'=> 'nullable|string',
        ]);

        $disciplina = Disciplina::findOrFail($id);
        $disciplina->update([
            'nome'      => $request->nome,
            'codigo'    => $request->codigo ?: null,
            'descricao' => $request->descricao ?: null,
        ]);

        return back()->with('success', 'Disciplina atualizada com sucesso!');
    }

    public function destroy($id)
    {
        Disciplina::findOrFail($id)->delete();
        return back()->with('success', 'Disciplina apagada com sucesso!');
    }
}