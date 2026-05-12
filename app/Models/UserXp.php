<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserXp extends Model
{
    protected $table = 'User_XP';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'xp_total',
        'nivel_atual',
        'xp_proximo_nivel',
        'ultima_atualizacao',
    ];

    protected $casts = [
        'xp_total' => 'integer',
        'nivel_atual' => 'integer',
        'xp_proximo_nivel' => 'integer',
        'ultima_atualizacao' => 'datetime',
    ];

    /**
     * O utilizador associado
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }

    /**
     * Adição de XP - atualiza nível se necessário
     */
    public function adicionarXp(int $xpGanho): void
    {
        $this->xp_total += $xpGanho;

        // Buscar o novo nível
        $novoNivel = Level::getNivelPorXp($this->xp_total);
        if ($novoNivel) {
            $this->nivel_atual = $novoNivel->nivel;
            $proximoNivel = Level::where('nivel', $novoNivel->nivel + 1)->first();
            $this->xp_proximo_nivel = $proximoNivel?->xp_requerido ?? 0;
        }

        $this->ultima_atualizacao = now();
        $this->save();
    }

    /**
     * Obtém o XP necessário para o próximo nível
     */
    public function xpParaProximoNivel(): int
    {
        $proximoNivel = Level::where('nivel', $this->nivel_atual + 1)->first();
        return $proximoNivel ? $proximoNivel->xp_requerido - $this->xp_total : 0;
    }

    /**
     * Percentagem de progressão no nível atual
     */
    public function percentagemNivel(): float
    {
        $nivelAtual = Level::where('nivel', $this->nivel_atual)->first();
        if (!$nivelAtual) return 0;

        $xpNivelAtual = $nivelAtual->xp_requerido;
        $xpNivelAnterior = Level::where('nivel', $this->nivel_atual - 1)->value('xp_requerido') ?? 0;

        $xpNeste = $this->xp_total - $xpNivelAnterior;
        $xpTotal = $xpNivelAtual - $xpNivelAnterior;

        return $xpTotal > 0 ? ($xpNeste / $xpTotal) * 100 : 0;
    }
}
