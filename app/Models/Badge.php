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

    const RARIDADES = ['comum', 'rara', 'epica', 'lendaria'];

    /**
     * Utilizadores que conquistaram esta badge
     */
    public function utilizadores(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'Inventario_Badges', 'id_badge', 'id_usuario')
            ->withPivot('id_desafio_origem', 'data_aquisicao')
            ->withTimestamps();
    }

    /**
     * Relação Polimórfica: Obtém todos os registos de histórico onde este badge aparece.
     */
    public function historicos(): MorphMany
    {
        return $this->morphMany(HistoricoAtividade::class, 'referencia');
    }

    /**
     * Verifica se a badge está ativa
     */
    public function isAtiva(): bool
    {
        return $this->ativa;
    }

    /**
     * Obtém a cor/classe CSS da raridade
     */
    public function getClasseRaridade(): string
    {
        return match($this->raridade) {
            'comum' => 'bg-gray-400',
            'rara' => 'bg-blue-400',
            'epica' => 'bg-purple-600',
            'lendaria' => 'bg-yellow-500',
            default => 'bg-gray-400',
        };
    }
}
