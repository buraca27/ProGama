<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DesafioAtribuicao extends Model
{
    use HasFactory;

    protected $table = 'Desafios_Atribuicoes';

    protected $fillable = [
        'id_desafio',
        'id_turma',
        'id_grupo',
        'id_aluno',
    ];

    public function desafio()
    {
        return $this->belongsTo(Desafio::class, 'id_desafio');
    }

    public function turma()
    {
        return $this->belongsTo(Turma::class, 'id_turma');
    }

    public function aluno()
    {
        return $this->belongsTo(User::class, 'id_aluno');
    }
}
