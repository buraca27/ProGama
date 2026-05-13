<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'email_pessoal',
        'nmr_processo_interno',
        'foto_perfil',
        'password',
        'id_role',
        'id_nivel',
        'id_turma',
        'must_change_password',
        'nif',
        'data_nascimento',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Para os Alunos (Role 3) - 1 Turma
    public function turma()
    {
        return $this->belongsTo(Turma::class, 'id_turma');
    }

    // Para os Professores (Role 2) - Várias Turmas
    public function turmasLecionadas()
    {
        return $this->belongsToMany(Turma::class, 'professor_turma', 'professor_id', 'turma_id');
    }

    public function historicoAtividades()
    {
        return $this->hasMany(HistoricoAtividade::class, 'id_aluno');
    }

    // --- RELAÇÕES DE GAMIFICAÇÃO ---

    /**
     * Dados de XP do utilizador
     */
    public function userXp()
    {
        return $this->hasOne(UserXp::class, 'id_usuario');
    }

    /**
     * Nível atual do utilizador
     */
    public function nivel()
    {
        return $this->belongsTo(Level::class, 'nivel_atual', 'nivel');
    }

    /**
     * Badges conquistadas pelo utilizador
     */
    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'Inventario_Badges', 'id_utilizador', 'id_badge')
            ->withPivot('id_desafio_origem', 'data_aquisicao')
            ->withTimestamps();
    }

    /**
     * Submissões de desafios feitas por este utilizador
     */
    public function submissoes()
    {
        return $this->hasMany(SubmissaoDesafioAluno::class, 'id_aluno');
    }

    /**
     * Atribuições de desafios para este utilizador
     */
    public function atribuicoes()
    {
        return $this->hasMany(AtribuicaoDesafio::class, 'id_aluno');
    }

    /**
     * Desafios criados por este professor
     */
    public function desafiosCriados()
    {
        return $this->hasMany(Desafio::class, 'id_formador');
    }

    // --- MÉTODOS DE GAMIFICAÇÃO ---

    /**
     * Obtém o XP total do utilizador
     */
    public function getXpTotal(): int
    {
        return $this->userXp?->xp_total ?? 0;
    }

    /**
     * Obtém o nível atual do utilizador
     */
    public function getNivelAtual(): int
    {
        return $this->userXp?->nivel_atual ?? 1;
    }

    /**
     * Obtém a percentagem de progresso no nível atual
     */
    public function getPercentagemNivel(): float
    {
        return $this->userXp?->percentagemNivel() ?? 0;
    }

    /**
     * Obtém o XP necessário para o próximo nível
     */
    public function getXpProximoNivel(): int
    {
        return $this->userXp?->xpParaProximoNivel() ?? 0;
    }

    /**
     * Retorna a contagem de badges
     */
    public function getContagemBadges(): int
    {
        return $this->badges()->count();
    }

    /**
     * Retorna a contagem de badges por raridade
     */
    public function getBadgesPorRaridade(string $raridade): int
    {
        return $this->badges()
            ->where('raridade', $raridade)
            ->count();
    }

    // --- RELAÇÕES SOCIAIS ---

    /**
     * Utilizadores que este utilizador segue.
     */
    public function seguindo()
    {
        return $this->belongsToMany(
            User::class,
            'Seguidores_Usuarios',
            'id_seguidor',
            'id_seguido'
        )->withTimestamps();
    }

    /**
     * Utilizadores que seguem este utilizador.
     */
    public function seguidores()
    {
        return $this->belongsToMany(
            User::class,
            'Seguidores_Usuarios',
            'id_seguido',
            'id_seguidor'
        )->withTimestamps();
    }

    public function solicitacoesEnviadas()
    {
        return $this->hasMany(SolicitacaoConexao::class, 'id_solicitante');
    }

    public function solicitacoesRecebidas()
    {
        return $this->hasMany(SolicitacaoConexao::class, 'id_destinatario');
    }

    public function isSeguindo(int $idOutroUsuario): bool
    {
        return $this->seguindo()->where('users.id', $idOutroUsuario)->exists();
    }

    public function isConectadoCom(int $idOutroUsuario): bool
    {
        return $this->isSeguindo($idOutroUsuario)
            && $this->seguidores()->where('users.id', $idOutroUsuario)->exists();
    }

    public function hasSolicitacaoPendentePara(int $idOutroUsuario): bool
    {
        return $this->solicitacoesEnviadas()
            ->where('id_destinatario', $idOutroUsuario)
            ->where('estado', 'pendente')
            ->exists();
    }

    public function hasSolicitacaoPendenteDe(int $idOutroUsuario): bool
    {
        return $this->solicitacoesRecebidas()
            ->where('id_solicitante', $idOutroUsuario)
            ->where('estado', 'pendente')
            ->exists();
    }
}
