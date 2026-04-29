<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nome'     => 'required|string|max:100|unique:Categorias,nome',
            'descricao'=> 'nullable|string',
        ]);

        Categoria::create([
            'nome'      => $request->nome,
            'descricao' => $request->descricao ?: null,
        ]);

        return back()->with('success', 'Categoria criada com sucesso!');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nome'     => 'required|string|max:100|unique:Categorias,nome,' . $id,
            'descricao'=> 'nullable|string',
        ]);

        $categoria = Categoria::findOrFail($id);
        $categoria->update([
            'nome'      => $request->nome,
            'descricao' => $request->descricao ?: null,
        ]);

        return back()->with('success', 'Categoria atualizada com sucesso!');
    }

    public function destroy($id)
    {
        Categoria::findOrFail($id)->delete();
        return back()->with('success', 'Categoria apagada com sucesso!');
    }
}
