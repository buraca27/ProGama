<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RespostaDesafioAluno extends Model
{
    protected $table = 'Respostas_Desafios_Alunos';

    protected $fillable = [
        'id_inscricao_desafio',
        'id_pergunta',
        'id_opcao_escolhida',
        'ids_opcoes_escolhidas',
        'resposta_texto',
        'url_ficheiro_submetido',
        'status_correcao',
        'pontuacao_obtida',
        'comentario_formador',
    ];

    protected $casts = [
        'ids_opcoes_escolhidas' => 'array',
        'pontuacao_obtida' => 'integer',
    ];

    /**
     * A inscrição no desafio a que pertence esta resposta
     */
    public function inscricaoDesafio(): BelongsTo
    {
        return $this->belongsTo(InscricaoDesafio::class, 'id_inscricao_desafio');
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
