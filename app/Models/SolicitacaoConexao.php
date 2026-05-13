<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitacaoConexao extends Model
{
    protected $table = 'Solicitacoes_Conexao';

    protected $fillable = [
        'id_solicitante',
        'id_destinatario',
        'estado',
    ];

    public function solicitante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_solicitante');
    }

    public function destinatario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_destinatario');
    }
}
