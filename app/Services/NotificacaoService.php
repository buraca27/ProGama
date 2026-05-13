<?php

namespace App\Services;

use App\Models\Notificacao;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class NotificacaoService
{
    public function criarParaUtilizador(
        int $idUtilizador,
        string $tipo,
        string $mensagem,
        ?int $idDesafioRelacionado = null,
        ?int $idUsuarioRelacionado = null
    ): Notificacao {
        return Notificacao::create([
            'id_utilizador' => $idUtilizador,
            'tipo_notificacao' => $tipo,
            'mensagem' => mb_substr($mensagem, 0, 255),
            'id_desafio_relacionado' => $idDesafioRelacionado,
            'id_usuario_relacionado' => $idUsuarioRelacionado,
            'lida' => false,
        ]);
    }

    public function criarParaUtilizadores(
        array $idsUtilizadores,
        string $tipo,
        string $mensagem,
        ?int $idDesafioRelacionado = null,
        ?int $idUsuarioRelacionado = null
    ): void {
        $ids = collect($idsUtilizadores)->map(fn($id) => (int) $id)->unique()->values();
        if ($ids->isEmpty()) {
            return;
        }

        $agora = now();
        $rows = $ids->map(fn($id) => [
            'id_utilizador' => $id,
            'tipo_notificacao' => $tipo,
            'mensagem' => mb_substr($mensagem, 0, 255),
            'id_desafio_relacionado' => $idDesafioRelacionado,
            'id_usuario_relacionado' => $idUsuarioRelacionado,
            'lida' => false,
            'created_at' => $agora,
            'updated_at' => $agora,
        ])->all();

        DB::table('Notificacoes')->insert($rows);
    }

    public function notificarNovoDesafioTurma(int $idTurma, int $idDesafio, string $tituloDesafio): void
    {
        $idsAlunos = User::query()
            ->where('id_role', 3)
            ->where('id_turma', $idTurma)
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->all();

        $this->criarParaUtilizadores(
            $idsAlunos,
            'Novo_Desafio',
            'Novo desafio atribuido: ' . $tituloDesafio,
            null,
            null,
            $idDesafio
        );
    }



    public function notificarDesafioCorrigido(int $idAluno, int $idDesafio, ?float $nota = null): void
    {
        $mensagem = 'O teu desafio foi avaliado.';
        if ($nota !== null) {
            $mensagem .= ' Nota: ' . number_format($nota, 2);
        }

        $this->criarParaUtilizador(
            $idAluno,
            'Desafio_Corrigido',
            $mensagem,
            $idDesafio
        );
    }

    public function dispararLembretesPrazoParaAluno(User $aluno): void
    {
        if ((int) $aluno->id_role !== 3) {
            return;
        }

        $limite = now()->addHours(24);

        $desafios = DB::table('Atribuicoes_Desafio as ad')
            ->join('Desafio as d', 'ad.id_desafio', '=', 'd.id')
            ->where(function ($q) use ($aluno) {
                $q->where('ad.id_aluno', '=', (int) $aluno->id)
                    ->orWhere(function ($q2) use ($aluno) {
                        $q2->whereNull('ad.id_aluno')
                            ->where('ad.id_turma', '=', (int) ($aluno->id_turma ?? 0));
                    });
            })
            ->where('d.data_fim', '>=', now())
            ->where('d.data_fim', '<=', $limite)
            ->select('d.id', 'd.titulo', 'd.data_fim')
            ->get();

        foreach ($desafios as $desafio) {
            $jaNotificado = Notificacao::query()
                ->where('id_utilizador', (int) $aluno->id)
                ->where('tipo_notificacao', 'Prazo_Proximo')
                ->where('id_desafio_relacionado', (int) $desafio->id)
                ->where('created_at', '>=', now()->subHours(12))
                ->exists();

            if ($jaNotificado) {
                continue;
            }

            $mensagem = 'Prazo proximo: "' . $desafio->titulo . '" termina em ' . now()->diffForHumans($desafio->data_fim, true) . '.';
            $this->criarParaUtilizador(
                (int) $aluno->id,
                'Prazo_Proximo',
                $mensagem,
                null,
                null,
                (int) $desafio->id
            );
        }
    }

    public function recentesParaUtilizador(int $idUtilizador, int $limite = 8): Collection
    {
        return Notificacao::query()
            ->where('id_utilizador', $idUtilizador)
            ->orderByDesc('created_at')
            ->limit($limite)
            ->get();
    }

    public function totalNaoLidas(int $idUtilizador): int
    {
        return Notificacao::query()
            ->where('id_utilizador', $idUtilizador)
            ->where('lida', false)
            ->count();
    }

    public function marcarComoLida(Notificacao $notificacao): void
    {
        if (!$notificacao->lida) {
            $notificacao->update(['lida' => true]);
        }
    }

    public function marcarTodasComoLidas(int $idUtilizador): void
    {
        Notificacao::query()
            ->where('id_utilizador', $idUtilizador)
            ->where('lida', false)
            ->update(['lida' => true]);
    }
}
