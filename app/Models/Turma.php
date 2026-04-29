<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Turma extends Model
{
    protected $table = 'Turmas';
    protected $fillable = ['nome', 'ano_letivo'];

    // Obter os alunos da turma
    public function alunos()
    {
        return $this->hasMany(User::class, 'id_turma')->where('id_role', 3);
    }

    // Obter os professores da turma
    public function professores()
    {
        return $this->belongsToMany(User::class, 'professor_turma', 'turma_id', 'professor_id')->where('id_role', 2);
    }

    public function atribuicoesTeste()
    {
        return $this->hasMany(TesteAtribuicao::class, 'id_turma');
    }
}
