<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Desafio extends Model
{
    protected $table = 'Desafio';

    protected $fillable = [
        'titulo',
        'descricao',
        'id_formador',
        'id_disciplina',
        'data_inicio',
        'data_fim',
        'tipo_avaliacao',
        'publica',
        'ativa',
        'pontuacao_automatica',
        'tentativas_maximas',
        'peso_nota',
        'nota_minima_passagem',
        'url_anexo_global',
        'exige_submissao',
        'cooldown_minutos',
        'tipo_recorrencia',
        'id_teste_associado',
        'duracao_minutos',
        'tipo_desafio',
        'xp_base',
        'badges_json',
        'auto_award_xp',
    ];

    protected $casts = [
        'data_inicio' => 'datetime',
        'data_fim' => 'datetime',
        'ativa' => 'boolean',
        'publica' => 'boolean',
        'exige_submissao' => 'boolean',
        'pontuacao_automatica' => 'boolean',
        'auto_award_xp' => 'boolean',
        'badges_json' => 'array',
    ];

    // ==========================================
    // RELAÇÕES PRINCIPAIS
    // ==========================================

    /**
     * O professor que criou este desafio
     */
    public function formador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_formador');
    }

    /**
     * A disciplina associada
     */
    public function disciplina(): BelongsTo
    {
        return $this->belongsTo(Disciplina::class, 'id_disciplina');
    }

    /**
     * Perguntas associadas ao desafio
     */
    public function perguntas(): BelongsToMany
    {
        return $this->belongsToMany(
            Pergunta::class,
            'Desafios_Perguntas',
            'id_desafio',
            'id_pergunta'
        )->withPivot('pontuacao_extra')->withTimestamps();
    }

    /**
     * Atribuições deste desafio
     */
    public function atribuicoes(): HasMany
    {
        return $this->hasMany(AtribuicaoDesafio::class, 'id_desafio');
    }

    /**
     * Submissões dos alunos
     */
    public function submissoes(): HasMany
    {
        return $this->hasMany(SubmissaoDesafioAluno::class, 'id_desafio');
    }

    /**
     * Regras de XP para este desafio
     */
    public function regrasXp(): HasMany
    {
        return $this->hasMany(RegraXpDesafio::class, 'id_desafio');
    }

    /**
     * Histórico de atividades
     */
    public function historicos(): MorphMany
    {
        return $this->morphMany(HistoricoAtividade::class, 'referencia');
    }

    // ==========================================
    // MÉTODOS ÚTEIS
    // ==========================================

    /**
     * Verifica se é um Quiz
     */
    public function isQuiz(): bool
    {
        return $this->tipo_desafio === 'Quiz';
    }

    /**
     * Verifica se é uma Tarefa
     */
    public function isTarefa(): bool
    {
        return $this->tipo_desafio === 'Tarefa';
    }

    /**
     * Verifica se ainda está ativo
     */
    public function estaAtivo(): bool
    {
        return $this->ativa && now()->between($this->data_inicio, $this->data_fim);
    }

    /**
     * Obtém os IDs das badges que podem ser conquistadas
     */
    public function getBadgeIds(): array
    {
        return $this->badges_json ?? [];
    }

    /**
     * Calcula XP baseado na nota obtida
     */
    public function calcularXpParaNota(float $nota): int
    {
        // Buscar regra que aplica a esta nota
        $regra = $this->regrasXp()
            ->where('nota_minima', '<=', $nota)
            ->where('nota_maxima', '>=', $nota)
            ->first();

        return $regra ? $regra->xp_atribuido : 0;
    }

    /**
     * Obtém o status do desafio para um aluno específico
     */
    public function getStatusParaAluno(int $idAluno): ?string
    {
        $submissao = $this->submissoes()
            ->where('id_aluno', $idAluno)
            ->latest('created_at')
            ->first();

        return $submissao?->estado;
    }
}
