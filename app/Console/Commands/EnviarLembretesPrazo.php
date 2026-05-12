<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\NotificacaoService;
use Illuminate\Console\Command;

class EnviarLembretesPrazo extends Command
{
    protected $signature = 'notificacoes:lembretes-prazo';

    protected $description = 'Envia notificações de prazo próximo a alunos com desafios a expirar nas próximas 24h';

    public function __construct(private NotificacaoService $notificacaoService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $alunos = User::where('id_role', 3)
            ->whereNotNull('id_turma')
            ->get();

        foreach ($alunos as $aluno) {
            $this->notificacaoService->dispararLembretesPrazoParaAluno($aluno);
        }

        $this->info("Lembretes de prazo enviados para {$alunos->count()} alunos.");

        return self::SUCCESS;
    }
}
