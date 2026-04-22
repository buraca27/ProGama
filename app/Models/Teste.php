<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Teste extends Model
{
    protected $table = 'Testes';
    protected $guarded = [];

    /**
     * Relação Polimórfica: Obtém todos os registos de histórico onde este teste aparece.
     */
    public function historicos(): MorphMany
    {
        return $this->morphMany(HistoricoAtividade::class, 'referencia');
    }
}