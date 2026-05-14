<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InscricaoDesafio extends Model
{
    use HasFactory;

    // Mapeia para a tabela unificada Submissoes_Desafio_Aluno
    protected $table = 'Submissoes_Desafio_Aluno';

    protected $fillable = [
        'id_desafio',
        'id_aluno',        // Mapeado de id_formando
        'id_atribuicao',
        'estado',
        'nota',
        'feedback_professor',
        'numero_tentativa',
        'data_inicio_resolucao',
        'data_submissao',   // Mapeado de data_ultima_tentativa
        'duracao_segundos',
        'metadata',
    ];

    protected $casts = [
        'data_inicio_resolucao' => 'datetime',
        'data_submissao' => 'datetime',
        'nota' => 'float',
        'numero_tentativa' => 'integer',
        'duracao_segundos' => 'integer',
        'metadata' => 'array',
    ];

    // Aliases para compatibilidade com código antigo
    protected $appends = ['id_formando', 'data_ultima_tentativa'];

    public function getIdFormandoAttribute()
    {
        return $this->id_aluno;
    }

    public function getDataUltimaTentativaAttribute()
    {
        return $this->data_submissao;
    }

    public function desafio()
    {
        return $this->belongsTo(Desafio::class, 'id_desafio');
    }

    public function aluno()
    {
        return $this->belongsTo(User::class, 'id_aluno');
    }

    public function respostas()
    {
        return $this->hasMany(RespostaDesafioAluno::class, 'id_submissao');
    }

    public function atribuicao()
    {
        return $this->belongsTo(AtribuicaoDesafio::class, 'id_atribuicao');
    }
}
