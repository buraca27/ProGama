<?php

namespace App\Services;

use App\Models\Notificacao;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class NotificacaoService
{
    private ?bool $hasIdUsuarioRelacionado = null;

    public function criarParaUtilizador(
        int $idUtilizador,
        string $tipo,
        string $mensagem,
        ?int $idDesafioRelacionado = null,
        ?int $idUsuarioRelacionado = null
    ): Notificacao {
        $payload = [
            'id_utilizador' => $idUtilizador,
            'tipo_notificacao' => $tipo,
            'mensagem' => mb_substr($mensagem, 0, 255),
            'id_desafio_relacionado' => $idDesafioRelacionado,
            'lida' => false,
        ];

        if ($this->supportsIdUsuarioRelacionado()) {
            $payload['id_usuario_relacionado'] = $idUsuarioRelacionado;
        }

        return Notificacao::create($payload);
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
            'lida' => false,
            'created_at' => $agora,
            'updated_at' => $agora,
        ])->map(function (array $row) use ($idUsuarioRelacionado) {
            if ($this->supportsIdUsuarioRelacionado()) {
                $row['id_usuario_relacionado'] = $idUsuarioRelacionado;
            }

            return $row;
        })->all();

        DB::table('Notificacoes')->insert($rows);
    }

    private function supportsIdUsuarioRelacionado(): bool
    {
        if ($this->hasIdUsuarioRelacionado !== null) {
            return $this->hasIdUsuarioRelacionado;
        }

        $this->hasIdUsuarioRelacionado = Schema::hasColumn('Notificacoes', 'id_usuario_relacionado');

        return $this->hasIdUsuarioRelacionado;
    }

    public function notificarNovoDesafioTurma(
        int $idTurma,
        int $idDesafio,
        string $tituloDesafio,
        $dataAbertura = null,
        $dataFecho = null,
        ?string $nomeCategoria = null,
        ?int $duracaoMinutos = null
    ): void {
        $idsAlunos = User::query()
            ->where('id_role', 3)
            ->where('id_turma', $idTurma)
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->all();

        $partes = ['"' . $tituloDesafio . '"'];

        if ($nomeCategoria) {
            $partes[] = 'Tema: ' . $nomeCategoria;
        }

        if ($dataAbertura) {
            $inicio = \Carbon\Carbon::parse($dataAbertura);
            $partes[] = 'Disponível a partir de ' . $inicio->format('d/m/Y \à\s H:i');
        }

        if ($dataAbertura && $dataFecho) {
            $inicio = \Carbon\Carbon::parse($dataAbertura);
            $fim = \Carbon\Carbon::parse($dataFecho);
            $diffHoras = (int) $inicio->diffInHours($fim);

            if ($diffHoras < 1) {
                $duracaoJanela = $inicio->diffInMinutes($fim) . ' minutos';
            } elseif ($diffHoras < 48) {
                $duracaoJanela = $diffHoras . ' hora' . ($diffHoras !== 1 ? 's' : '');
            } else {
                $diffDias = (int) round($diffHoras / 24);
                $duracaoJanela = $diffDias . ' dia' . ($diffDias !== 1 ? 's' : '');
            }

            $partes[] = 'Tens ' . $duracaoJanela . ' para realizar';
        }

        if ($duracaoMinutos) {
            $partes[] = 'Limite por tentativa: ' . $duracaoMinutos . ' min';
        }

        $mensagem = 'Novo desafio: ' . implode('. ', $partes) . '.';

        $this->criarParaUtilizadores(
            $idsAlunos,
            'Novo_Desafio',
            $mensagem,
            $idDesafio
        );
    }



    public function notificarSubmissaoAluno(int $idProfessor, int $idAluno, string $nomeAluno, int $idDesafio, string $tituloDesafio, ?int $idSubmissao = null): void
    {
        $sufixo = $idSubmissao ? '. Clica para ver as respostas.' : '.';
        $mensagem = mb_substr(
            'O aluno "' . $nomeAluno . '" submeteu o desafio "' . $tituloDesafio . '"' . $sufixo,
            0,
            255
        );

        Notificacao::create([
            'id_utilizador'            => $idProfessor,
            'tipo_notificacao'         => 'Submissao_Aluno',
            'mensagem'                 => $mensagem,
            'id_desafio_relacionado'   => $idDesafio,
            'id_submissao_relacionada' => $idSubmissao,
            'lida'                     => false,
        ]);
    }

    public function notificarAlteracaoDatasDesafio(int $idTurma, int $idDesafio, string $tituloDesafio, $novaAbertura, $novoFecho): void
    {
        $idsAlunos = User::query()
            ->where('id_role', 3)
            ->where('id_turma', $idTurma)
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->all();

        if (empty($idsAlunos)) {
            return;
        }

        Notificacao::whereIn('id_utilizador', $idsAlunos)
            ->where('id_desafio_relacionado', $idDesafio)
            ->whereIn('tipo_notificacao', ['Novo_Desafio', 'Alteracao_Datas'])
            ->where('lida', false)
            ->delete();

        $abertura = $novaAbertura ? \Carbon\Carbon::parse($novaAbertura)->format('d/m/Y H:i') : '—';
        $fecho    = $novoFecho    ? \Carbon\Carbon::parse($novoFecho)->format('d/m/Y H:i')    : '—';
        $mensagem = mb_substr(
            'As datas do desafio "' . $tituloDesafio . '" foram alteradas. Nova janela: ' . $abertura . ' até ' . $fecho . '.',
            0, 255
        );

        $this->criarParaUtilizadores($idsAlunos, 'Alteracao_Datas', $mensagem, $idDesafio);
    }

    public function notificarAlertaIntegridade(int $idProfessor, int $idAluno, string $nomeAluno, int $idDesafio, string $tituloDesafio, int $tabSwitches): void
    {
        $mensagem = mb_substr(
            'ALERTA: O aluno "' . $nomeAluno . '" realizou o desafio "' . $tituloDesafio . '" (SEM CONSULTA) com ' . $tabSwitches . ' troca(s) de aba/janela. A submissão foi automaticamente classificada com 0 valores — aguarda revisão.',
            0,
            255
        );

        Notificacao::create([
            'id_utilizador'          => $idProfessor,
            'tipo_notificacao'       => 'Alerta_Integridade',
            'mensagem'               => $mensagem,
            'id_desafio_relacionado' => $idDesafio,
            'lida'                   => false,
        ]);
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
                ->exists(); // REMOVIDA A CONDIÇÃO DAS 12 HORAS AQUI!

            // Se já foi notificado alguma vez para este desafio, ignora e não faz SPAM.
            if ($jaNotificado) {
                continue;
            }

            $mensagem = 'Prazo próximo: "' . $desafio->titulo . '" termina ' . now()->diffForHumans($desafio->data_fim, true) . '.';

            $this->criarParaUtilizador(
                (int) $aluno->id,
                'Prazo_Proximo',
                $mensagem,
                (int) $desafio->id // Corrigido a passagem do ID aqui também!
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
