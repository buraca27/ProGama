<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Level extends Model
{
    protected $table = 'Levels';

    protected $fillable = [
        'nivel',
        'xp_requerido',
        'nome_nivel',
        'descricao',
    ];

    /**
     * Relação com usuários neste nível
     */
    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'nivel_atual', 'nivel');
    }

    /**
     * Obtém o nível pelo número de XP
     */
    public static function getNivelPorXp(int $xpTotal): ?self
    {
        return self::where('xp_requerido', '<=', $xpTotal)
            ->orderByDesc('xp_requerido')
            ->first();
    }

    /**
     * Obtém o XP necessário para o próximo nível
     */
    public function getXpProximoNivel(): ?int
    {
        return self::where('nivel', $this->nivel + 1)
            ->value('xp_requerido');
    }
}
