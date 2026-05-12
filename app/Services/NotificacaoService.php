<?php

namespace App\Services;

use App\Models\Notificacao;
use App\Models\Turma;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class NotificacaoService
{
    public function criarParaUtilizador(
        int $idUtilizador,
        string $tipo,
        string $mensagem,
        ?int $idTeste = null,
        ?int $idDesafio = null,
        ?int $idDesafioRelacionado = null
    ): Notificacao {
        return Notificacao::create([
            'id_utilizador' => $idUtilizador,
            'tipo_notificacao' => $tipo,
            'mensagem' => mb_substr($mensagem, 0, 255),
            'id_teste' => $idTeste,
            'id_desafio' => $idDesafio,
            'id_desafio_relacionado' => $idDesafioRelacionado,
            'lida' => false,
        ]);
    }

    public function criarParaUtilizadores(
        array $idsUtilizadores,
        string $tipo,
        string $mensagem,
        ?int $idTeste = null,
        ?int $idDesafio = null,
        ?int $idDesafioRelacionado = null
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
            'id_teste' => $idTeste,
            'id_desafio' => $idDesafio,
            'id_desafio_relacionado' => $idDesafioRelacionado,
            'lida' => false,
            'created_at' => $agora,
            'updated_at' => $agora,
        ])->all();

        DB::table('Notificacoes')->insert($rows);
    }

    public function notificarProfessorSubmissao(int $idProfessor, string $nomeAluno, string $nomeTurma, string $tituloDesafio, ?int $idDesafio = null): void
    {
        $mensagem = "{$nomeAluno} ({$nomeTurma}) submeteu o desafio \"{$tituloDesafio}\".";

        $this->criarParaUtilizador(
            $idProfessor,
            'Submissao_Aluno',
            $mensagem,
            null,
            null,
            $idDesafio,
        );
    }

    public function notificarBadgeGanho(int $idAluno, string $nomeBadge, string $raridade): void
    {
        $mensagem = "Conquistaste o badge \"{$nomeBadge}\" ({$raridade})!";

        $this->criarParaUtilizador(
            $idAluno,
            'Badge_Ganho',
            $mensagem,
        );
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

    public function notificarTesteCorrigido(int $idAluno, ?int $idTeste, ?float $notaFinal = null): void
    {
        $mensagem = 'O teu teste foi corrigido.';
        if ($notaFinal !== null) {
            $mensagem .= ' Nota: ' . number_format($notaFinal, 2);
        }

        $this->criarParaUtilizador(
            $idAluno,
            'Teste_Corrigido',
            $mensagem,
            $idTeste,
            null,
            null
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
            'Teste_Corrigido',
            $mensagem,
            null,
            null,
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
