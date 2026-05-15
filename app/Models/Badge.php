<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Badge extends Model
{
    protected $table = 'Badges';

    protected $fillable = [
        'nome',
        'descricao',
        'icone_url',
        'tipo_criterio',
        'valor_criterio',
        'ativa',
        'raridade',
    ];

    protected $casts = [
        'ativa' => 'boolean',
    ];

    const RARIDADES = [
        1 => 'Bronze',
        2 => 'Prata',
        3 => 'Ouro',
        4 => 'Lendária',
    ];

    public function utilizadores(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'Inventario_Badges', 'id_badge', 'id_utilizador')
            ->withPivot('id_desafio_origem', 'data_obtencao')
            ->withTimestamps();
    }

    public function historicos(): MorphMany
    {
        return $this->morphMany(HistoricoAtividade::class, 'referencia');
    }

    public function isAtiva(): bool
    {
        return $this->ativa;
    }

    public function getNomeRaridade(): string
    {
        return self::RARIDADES[(int) $this->raridade] ?? 'Bronze';
    }

    public function getClasseRaridade(): string
    {
        return match ((int) $this->raridade) {
            2 => 'bg-slate-400',
            3 => 'bg-amber-500',
            4 => 'bg-purple-600',
            default => 'bg-orange-400',
        };
    }
}
