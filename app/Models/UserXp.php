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
     * Adição de XP - atualiza nível e cache do próximo nível.
     */
    public function adicionarXp(int $xpGanho): void
    {
        $this->xp_total += $xpGanho;

        $novoNivel = Level::getNivelPorXp($this->xp_total);
        if ($novoNivel) {
            $this->nivel_atual = $novoNivel->nivel;
            $this->xp_proximo_nivel = $this->calcularXpProximoNivel($novoNivel->nivel);
        }

        $this->ultima_atualizacao = now();
        $this->save();
    }

    /**
     * Retorna o XP cumulativo requerido para o próximo nível.
     * Usado no frontend como denominador da barra: "{xp_total} / {xp_proximo_nivel} XP".
     * Se estiver no nível máximo, retorna o xp_requerido do nível atual.
     */
    public function xpParaProximoNivel(): int
    {
        return $this->calcularXpProximoNivel($this->nivel_atual);
    }

    public function xpNivelAtual(): int
    {
        return Level::where('nivel', $this->nivel_atual)->value('xp_requerido') ?? 0;
    }

    /**
     * Percentagem de progresso dentro do nível atual (0–100).
     * Mede a distância entre o limiar do nível atual e o do próximo nível.
     */
    public function percentagemNivel(): float
    {
        $currentLevel = Level::where('nivel', $this->nivel_atual)->first();
        $nextLevel    = Level::where('nivel', $this->nivel_atual + 1)->first();

        if (!$nextLevel) return 100.0; // nível máximo

        $xpEntrada  = $currentLevel?->xp_requerido ?? 0; // XP para entrar no nível atual
        $xpSaida    = $nextLevel->xp_requerido;           // XP para entrar no próximo nível
        $xpNeste    = max(0, $this->xp_total - $xpEntrada);
        $xpNeeded   = $xpSaida - $xpEntrada;

        return $xpNeeded > 0 ? min(($xpNeste / $xpNeeded) * 100.0, 100.0) : 0.0;
    }

    private function calcularXpProximoNivel(int $nivelAtual): int
    {
        $proximo = Level::where('nivel', $nivelAtual + 1)->value('xp_requerido');
        if ($proximo !== null) return $proximo;
        // Nível máximo: retorna o xp_requerido do nível atual
        return Level::where('nivel', $nivelAtual)->value('xp_requerido') ?? $this->xp_total;
    }
}
