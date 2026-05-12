<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RespostaDesafioAluno extends Model
{
    protected $table = 'Respostas_Desafio_Aluno';

    protected $fillable = [
        'id_submissao',
        'id_pergunta',
        'resposta_texto',
        'ids_opcoes_escolhidas',
        'correta',
        'pontuacao',
    ];

    protected $casts = [
        'ids_opcoes_escolhidas' => 'array',
        'correta' => 'boolean',
        'pontuacao' => 'float',
    ];

    /**
     * A submissão a que pertence esta resposta
     */
    public function submissao(): BelongsTo
    {
        return $this->belongsTo(SubmissaoDesafioAluno::class, 'id_submissao');
    }

    /**
     * A pergunta respondida
     */
    public function pergunta(): BelongsTo
    {
        return $this->belongsTo(Pergunta::class, 'id_pergunta');
    }

    /**
     * Obtém as opções escolhidas como objetos
     */
    public function opcoesSelecionadas()
    {
        if (!$this->ids_opcoes_escolhidas) {
            return collect();
        }

        return OpcaoPergunta::whereIn('id', $this->ids_opcoes_escolhidas)->get();
    }

    /**
     * Verifica se a resposta está correta
     */
    public function isCorreta(): bool
    {
        return $this->correta;
    }

    // ==========================================
    // COMPATIBILIDADE COM MODELO ANTIGO
    // ==========================================
    // Manter métodos que podem ser usados em código legado

    public function inscricao()
    {
        return $this->submissao; // Redireção para compatibilidade
    }

    public function opcaoEscolhida()
    {
        // Para compatibilidade, retorna a primeira opção escolhida se existir
        $ids = $this->ids_opcoes_escolhidas;
        if (!$ids || count($ids) === 0) {
            return null;
        }
        return OpcaoPergunta::find($ids[0]);
    }
}
