<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InscricaoDesafio extends Model
{
    use HasFactory;

    protected $table = 'Inscricoes_Desafios';

    protected $fillable = [
        'id_desafio',
        'id_formando',
        'estado',
        'caminho_ficheiro',
        'data_inicio_resolucao',
        'data_ultima_tentativa',
        'tab_switches',
    ];

    protected $casts = [
        'data_inicio_resolucao' => 'datetime',
        'data_ultima_tentativa' => 'datetime',
        'tab_switches' => 'integer',
    ];

    public function desafio()
    {
        return $this->belongsTo(Desafio::class, 'id_desafio');
    }

    public function aluno()
    {
        return $this->belongsTo(User::class, 'id_formando');
    }

    public function respostas()
    {
        return $this->hasMany(RespostaDesafioAluno::class, 'id_submissao');
    }
}
