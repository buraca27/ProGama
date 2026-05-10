<?php

namespace App\Models;

use App\Models\RespostaAluno;
use App\Models\Teste;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TesteRealizado extends Model
{
    use HasFactory;

    protected $table = 'Testes_Realizados';

    protected $fillable = [
        'id_teste',
        'id_aluno',
        'data_inicio_resolucao',
        'data_submissao',
        'nota_final',
        'estado',
        'corrigido_por',
        'corrigido_em',
        'publicado_em',
    ];

    protected $casts = [
        'data_inicio_resolucao' => 'datetime',
        'data_submissao' => 'datetime',
        'corrigido_em' => 'datetime',
        'publicado_em' => 'datetime',
    ];

    public function teste()
    {
        return $this->belongsTo(Teste::class, 'id_teste');
    }

    public function aluno()
    {
        return $this->belongsTo(User::class, 'id_aluno');
    }

    public function respostas()
    {
        return $this->hasMany(RespostaAluno::class, 'id_teste_realizado');
    }

    public function corrigidoPor()
    {
        return $this->belongsTo(User::class, 'corrigido_por');
    }
}
