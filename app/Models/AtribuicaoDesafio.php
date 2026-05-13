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
        'observacoes',
    ];

    protected $casts = [
        'data_inicio_tentativas' => 'datetime',
        'data_fim_tentativas' => 'datetime',
        'tentativas_maximas' => 'integer',
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
     * As inscrições (tentativas) feitas para esta atribuição
     * Contamos através do desafio, já que não há id_atribuicao em Inscricoes_Desafios
     */
    public function submissoes(): HasMany
    {
        return $this->hasMany(SubmissaoDesafioAluno::class, 'id_atribuicao');
    }

    /**
     * As inscrições do desafio (para contar tentativas)
     */
    public function inscricoes()
    {
        return InscricaoDesafio::where('id_desafio', $this->id_desafio)
            ->whereIn('estado', ['Submetido', 'Concluido', 'Falhado']);
    }

    /**
     * Verifica se a atribuição ainda é válida
     */
    public function estaValida(): bool
    {
        return now()->between($this->data_inicio_tentativas, $this->data_fim_tentativas);
    }

    /**
     * Obtém o número de tentativas restantes para um aluno específico
     */
    public function tentativasRestantes(int $idAluno): int
    {
        // Se null, tentativas ilimitadas
        if ($this->tentativas_maximas === null) {
            return 999; // Número grande para representar ilimitado
        }

        $tentativasFeitas = InscricaoDesafio::where('id_desafio', $this->id_desafio)
            ->where('id_formando', $idAluno)
            ->whereIn('estado', ['Submetido', 'Concluido', 'Falhado'])
            ->count();

        return max(0, $this->tentativas_maximas - $tentativasFeitas);
    }

    /**
     * Verifica se ainda há tentativas disponíveis para um aluno
     */
    public function temTentativasDisponiveis(int $idAluno): bool
    {
        // Se null, sempre tem tentativas (ilimitado)
        if ($this->tentativas_maximas === null) {
            return true;
        }

        return $this->tentativasRestantes($idAluno) > 0;
    }
}
