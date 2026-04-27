<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HistoricoAtividade extends Model
{
    use HasFactory;

    // Define o nome exato da tabela na base de dados
    protected $table = 'Historico_Atividades';

    // Campos que podem ser preenchidos via create() ou update()
    protected $fillable = [
        'id_aluno',
        'referencia_type',
        'referencia_id',
        'descricao',
        'xp_ganho',
        'id_badge_ganho',
    ];

    /**
     * Relação Polimórfica: 
     * Permite que este registo aponte para um Teste, Desafio ou Badge.
     */
    public function referencia(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Relação com o Aluno (User)
     */
    public function aluno(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_aluno');
    }

    /**
     * Relação opcional com um Badge específico ganho
     */
    public function badge(): BelongsTo
    {
        return $this->belongsTo(Badge::class, 'id_badge_ganho');
    }
}