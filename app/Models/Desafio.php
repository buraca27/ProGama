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
        'id_categoria',
        'data_inicio',
        'data_fim',
        'tipo_avaliacao',
        'publica',
        'ativa',
        'ativo',
        'pontuacao_automatica',
        'tentativas_maximas',
        'peso_nota',
        'nota_minima_passagem',
        'url_anexo_global',
        'anexos_professor_json',
        'exige_submissao',
        'cooldown_minutos',
        'tipo_recorrencia',
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
        'ativo' => 'boolean',
        'publica' => 'boolean',
        'exige_submissao' => 'boolean',
        'pontuacao_automatica' => 'boolean',
        'auto_award_xp' => 'boolean',
        'badges_json' => 'array',
        'anexos_professor_json' => 'array',
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
     * A categoria associada
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'id_categoria');
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
        return collect($this->badges_json ?? [])
            ->map(function ($badge) {
                if (is_array($badge)) {
                    return $badge['id'] ?? null;
                }

                return $badge;
            })
            ->filter(fn($id) => is_numeric($id))
            ->map(fn($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
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

        if ($regra) {
            return (int) $regra->xp_atribuido;
        }

        return (int) ($this->xp_base ?? 0);
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
