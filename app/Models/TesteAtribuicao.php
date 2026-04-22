<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TesteAtribuicao extends Model
{
    use HasFactory;

    protected $table = 'Testes_Atribuicoes';

    protected $fillable = [
        'id_teste',
        'id_turma',
        'id_grupo',
        'id_aluno',
    ];

    public function teste()
    {
        return $this->belongsTo(Teste::class, 'id_teste');
    }

    public function turma()
    {
        return $this->belongsTo(Turma::class, 'id_turma');
    }
}
