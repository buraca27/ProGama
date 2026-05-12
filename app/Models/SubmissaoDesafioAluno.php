<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubmissaoDesafioAluno extends Model
{
    protected $table = 'Submissoes_Desafio_Aluno';

    protected $fillable = [
        'id_desafio',
        'id_aluno',
        'id_atribuicao',
        'estado',
        'nota',
        'feedback_professor',
        'numero_tentativa',
        'data_inicio_resolucao',
        'data_submissao',
        'duracao_segundos',
        'metadata',
    ];

    protected $casts = [
        'nota' => 'float',
        'numero_tentativa' => 'integer',
        'duracao_segundos' => 'integer',
        'metadata' => 'array',
        'data_inicio_resolucao' => 'datetime',
        'data_submissao' => 'datetime',
    ];

    // Estados possíveis
    public const PENDENTE = 'Pendente';
    public const EM_RESOLUCAO = 'Em_Resolucao';
    public const SUBMETIDO = 'Submetido';
    public const AVALIADO = 'Avaliado';
    public const FALHADO = 'Falhado';
    public const CONCLUIDO = 'Concluido';

    /**
     * O desafio associado
     */
    public function desafio(): BelongsTo
    {
        return $this->belongsTo(Desafio::class, 'id_desafio');
    }

    /**
     * O aluno que fez a submissão
     */
    public function aluno(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_aluno');
    }

    /**
     * A atribuição associada
     */
    public function atribuicao(): BelongsTo
    {
        return $this->belongsTo(AtribuicaoDesafio::class, 'id_atribuicao');
    }

    /**
     * As respostas dadas pelo aluno
     */
    public function respostas(): HasMany
    {
        return $this->hasMany(RespostaDesafioAluno::class, 'id_submissao');
    }

    /**
     * Verifica se está pendente
     */
    public function isPendente(): bool
    {
        return $this->estado === self::PENDENTE;
    }

    /**
     * Verifica se está em resolução
     */
    public function isEmResolucao(): bool
    {
        return $this->estado === self::EM_RESOLUCAO;
    }

    /**
     * Verifica se foi submetido
     */
    public function isSubmetido(): bool
    {
        return $this->estado === self::SUBMETIDO;
    }

    /**
     * Verifica se foi avaliado
     */
    public function isAvaliado(): bool
    {
        return $this->estado === self::AVALIADO;
    }

    /**
     * Verifica se falhou
     */
    public function isFalhado(): bool
    {
        return $this->estado === self::FALHADO;
    }

    /**
     * Verifica se concluiu
     */
    public function isConcluido(): bool
    {
        return $this->estado === self::CONCLUIDO;
    }

    /**
     * Obtém o tempo decorrido da tentativa
     */
    public function getTempoDecorrido(): ?string
    {
        if (!$this->data_inicio_resolucao) return null;

        $fim = $this->data_submissao ?? now();
        $duracao = $this->data_inicio_resolucao->diffInSeconds($fim);

        $horas = intdiv($duracao, 3600);
        $minutos = intdiv($duracao % 3600, 60);
        $segundos = $duracao % 60;

        return sprintf('%02d:%02d:%02d', $horas, $minutos, $segundos);
    }
}
