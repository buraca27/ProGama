<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificacao extends Model
{
    protected $table = 'Notificacoes';

    protected $fillable = [
        'id_utilizador',
        'tipo_notificacao',
        'mensagem',
        'id_desafio_relacionado',
        'id_usuario_relacionado',
        'id_submissao_relacionada',
        'lida',
    ];

    protected $casts = [
        'lida' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_utilizador');
    }

    public function scopeNaoLidas($query)
    {
        return $query->where('lida', false);
    }
}
