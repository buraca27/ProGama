<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegraXpDesafio extends Model
{
    protected $table = 'Regras_XP_Desafio';
    public $timestamps = false;

    protected $fillable = [
        'id_desafio',
        'nota_minima',
        'nota_maxima',
        'xp_atribuido',
    ];

    protected $casts = [
        'nota_minima' => 'float',
        'nota_maxima' => 'float',
        'xp_atribuido' => 'integer',
    ];

    /**
     * O desafio ao qual esta regra se aplica
     */
    public function desafio(): BelongsTo
    {
        return $this->belongsTo(Desafio::class, 'id_desafio');
    }

    /**
     * Determina se uma nota se enquadra nesta regra
     */
    public function aplicavelPara(float $nota): bool
    {
        return $nota >= $this->nota_minima && $nota <= $this->nota_maxima;
    }

    /**
     * Busca a regra aplicável para uma nota específica
     */
    public static function regraParaNota(int $idDesafio, float $nota): ?self
    {
        return self::where('id_desafio', $idDesafio)
            ->where('nota_minima', '<=', $nota)
            ->where('nota_maxima', '>=', $nota)
            ->first();
    }
}
