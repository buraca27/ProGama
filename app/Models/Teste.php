<?php

namespace App\Models;

use App\Models\Pergunta;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teste extends Model
{
    use HasFactory;

    protected $table = 'Testes';

    protected $fillable = [
        'titulo',
        'tipo_avaliacao',
        'id_formador',
        'data_hora_abertura',
        'data_hora_fecho',
        'duracao_minutos',
        'peso_avaliacao',
        'url_anexo_global',
    ];

    public function perguntas()
    {
        return $this->belongsToMany(Pergunta::class, 'Testes_Perguntas', 'id_teste', 'id_pergunta')
            ->withPivot('valor_pontuacao')
            ->withTimestamps();
    }
}
