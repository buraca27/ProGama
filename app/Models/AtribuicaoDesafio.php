<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AtribuicaoDesafio extends Model
{
    protected $table = 'Atribuicoes_Desafio';

    protected $fillable = [
        'id_desafio',
        'id_turma',
        'id_grupo',
        'id_aluno',
        'data_inicio_tentativas',
        'data_fim_tentativas',
        'tentativas_maximas',
        'sem_consulta',
        'observacoes',
    ];

    protected $casts = [
        'data_inicio_tentativas' => 'datetime',
        'data_fim_tentativas' => 'datetime',
        'tentativas_maximas' => 'integer',
        'sem_consulta' => 'boolean',
    ];

    /**
     * O desafio atribuído
     */
    public function desafio(): BelongsTo
    {
        return $this->belongsTo(Desafio::class, 'id_desafio');
    }

    /**
     * A turma a que foi atribuído (se aplicável)
     */
    public function turma(): BelongsTo
    {
        return $this->belongsTo(Turma::class, 'id_turma');
    }

    /**
     * O aluno específico (se a atribuição for individual)
     */
    public function aluno(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_aluno');
    }

    /**
     * As submissões feitas para esta atribuição
     */
    public function submissoes(): HasMany
    {
        return $this->hasMany(SubmissaoDesafioAluno::class, 'id_atribuicao');
    }

    /**
     * Verifica se a atribuição ainda é válida
     */
    public function estaValida(): bool
    {
        return now()->between($this->data_inicio_tentativas, $this->data_fim_tentativas);
    }

    /**
     * Obtém o número de tentativas restantes
     */
    public function tentativasRestantes(): int
    {
        $tentativasFeitas = $this->submissoes()->count();
        return max(0, $this->tentativas_maximas - $tentativasFeitas);
    }

    /**
     * Verifica se ainda há tentativas disponíveis
     */
    public function temTentativasDisponiveis(): bool
    {
        return $this->tentativasRestantes() > 0;
    }
}
