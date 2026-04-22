<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Desafio extends Model
{
    // O nome da tabela na base de dados
    protected $table = 'Desafios';
    
    protected $guarded = []; // Permite preencher todos os campos

    /**
     * Relação Polimórfica: Obtém todos os registos de histórico onde este desafio aparece.
     */
    public function historicos(): MorphMany
    {
        return $this->morphMany(HistoricoAtividade::class, 'referencia');
    }
}