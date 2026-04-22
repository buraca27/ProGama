<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Badge extends Model
{
    protected $table = 'Badges';
    protected $guarded = [];

    /**
     * Relação Polimórfica: Obtém todos os registos de histórico onde este badge aparece.
     */
    public function historicos(): MorphMany
    {
        return $this->morphMany(HistoricoAtividade::class, 'referencia');
    }
}