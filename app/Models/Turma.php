<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Turma extends Model
{
    use HasFactory;

    protected $table = 'Turmas';

    protected $fillable = [
        'nome',
        'ano_letivo',
    ];

    /**
     * Relação: Uma turma pode ter múltiplos alunos
     */
    public function alunos()
    {
        return $this->hasMany(User::class, 'id_turma', 'id');
    }

    /**
     * Relação: Uma turma pode ter múltiplos professores
     */
    public function professores()
    {
        return $this->belongsToMany(
            User::class,
            'Professor_Turma',
            'id_turma',
            'id_professor'
        );
    }
}
