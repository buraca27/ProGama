<?php

namespace App\Models;

use App\Models\OpcaoPergunta;
use App\Models\Pergunta;
use App\Models\TesteRealizado;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RespostaAluno extends Model
{
    use HasFactory;

    protected $table = 'Respostas_Alunos';

    protected $fillable = [
        'id_teste_realizado',
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
    ];

    public function testeRealizado()
    {
        return $this->belongsTo(TesteRealizado::class, 'id_teste_realizado');
    }

    public function pergunta()
    {
        return $this->belongsTo(Pergunta::class, 'id_pergunta');
    }

    public function opcaoEscolhida()
    {
        return $this->belongsTo(OpcaoPergunta::class, 'id_opcao_escolhida');
    }
}
