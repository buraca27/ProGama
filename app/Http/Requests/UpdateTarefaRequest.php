<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTarefaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->id_role === 2;
    }

    public function rules(): array
    {
        return [
            'data_hora_abertura' => 'required|date|before_or_equal:data_hora_fecho',
            'data_hora_fecho' => 'required|date|after:data_hora_abertura',
            'tentativas_maximas' => 'nullable|integer|min:1|max:10',
        ];
    }

    public function messages(): array
    {
        return [
            'data_hora_fecho.after' => 'A data de fecho deve ser posterior à data de abertura.',
            'data_hora_abertura.before_or_equal' => 'A data de abertura não pode ser posterior à data de fecho.',
            'tentativas_maximas.min' => 'As tentativas máximas devem ser pelo menos 1.',
            'tentativas_maximas.max' => 'As tentativas máximas não podem exceder 10.',
        ];
    }
}
