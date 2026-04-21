<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
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

    // --- RELAÇÕES DE TURMAS ---

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
}
