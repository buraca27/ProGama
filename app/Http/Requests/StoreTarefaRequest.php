<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTarefaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->id_role === 2;
    }

    public function rules(): array
    {
        return [
            'id_desafio' => 'required|integer|exists:Desafio,id',
            'turma_ids' => 'required|array|min:1',
            'turma_ids.*' => 'integer|exists:Turmas,id',
            'data_hora_abertura' => 'required|date|before_or_equal:data_hora_fecho',
            'data_hora_fecho' => 'required|date|after:data_hora_abertura',
            'tentativas_maximas' => 'nullable|integer|min:1|max:10',
            'anexo_global_ficheiro' => 'nullable|file|max:10240',
        ];
    }

    public function messages(): array
    {
        return [
            'data_hora_fecho.after' => 'A data de fecho deve ser posterior à data de abertura.',
            'data_hora_abertura.before_or_equal' => 'A data de abertura não pode ser posterior à data de fecho.',
            'tentativas_maximas.min' => 'As tentativas máximas devem ser pelo menos 1.',
            'tentativas_maximas.max' => 'As tentativas máximas não podem exceder 10.',
            'anexo_global_ficheiro.max' => 'O ficheiro não pode exceder 10MB.',
            'turma_ids.required' => 'Deve selecionar pelo menos uma turma.',
            'turma_ids.min' => 'Deve selecionar pelo menos uma turma.',
        ];
    }
}
