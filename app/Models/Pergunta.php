<?php

namespace App\Models;

use App\Models\OpcaoPergunta;
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

    public function desafios()
    {
        return $this->belongsToMany(Desafio::class, 'Desafios_Perguntas', 'id_pergunta', 'id_desafio')
            ->withPivot('pontuacao_extra')
            ->withTimestamps();
    }

    public function testes()
    {
        return $this->desafios();
    }
}
