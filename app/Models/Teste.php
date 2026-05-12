<?php

namespace App\Models;

use App\Models\Pergunta;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Teste extends Model
{
    use HasFactory;

    protected $table = 'Testes';

    protected $fillable = [
        'titulo',
        'tipo_avaliacao',
        'instrucoes',
        'id_formador',
        'id_categoria',
        'data_hora_abertura',
        'data_hora_fecho',
        'duracao_minutos',
        'peso_avaliacao',
        'url_anexo_global',
    ];

    public function perguntas()
    {
        return $this->belongsToMany(Pergunta::class, 'Testes_Perguntas', 'id_teste', 'id_pergunta')
            ->withPivot('valor_pontuacao')
            ->withTimestamps();
    }

    public function atribuicoes()
    {
        return $this->hasMany(TesteAtribuicao::class, 'id_teste');
    }

    public function realizados()
    {
        return $this->hasMany(TesteRealizado::class, 'id_teste');
    }

    public function historicos(): MorphMany
    {
        return $this->morphMany(HistoricoAtividade::class, 'referencia');
    }

    public function desafioAssociado()
    {
        return $this->hasOne(Desafio::class, 'id_teste_associado', 'id');
    }
}
