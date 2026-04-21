<?php

namespace App\Models;

use App\Models\OpcaoPergunta;
use App\Models\Teste;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pergunta extends Model
{
    use HasFactory;

    protected $table = 'Perguntas';

    protected $fillable = [
        'texto',
        'tipo_pergunta',
        'id_categoria',
        'id_formador_criador',
        'url_anexo_pergunta',
    ];

    public function opcoes()
    {
        return $this->hasMany(OpcaoPergunta::class, 'id_pergunta');
    }

    public function testes()
    {
        return $this->belongsToMany(Teste::class, 'Testes_Perguntas', 'id_pergunta', 'id_teste')
            ->withPivot('valor_pontuacao')
            ->withTimestamps();
    }
}
