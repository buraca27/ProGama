<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Disciplina extends Model
{
    use HasFactory;
    protected $table = 'Disciplinas';
    public $timestamps = false;

    // Permite que o Laravel grave o nome da disciplina
    protected $fillable = [
        'nome',
        'codigo',
        'descricao'
    ];
    
    public function professores()
    {
        return $this->belongsToMany(User::class, 'disciplina_professor', 'id_disciplina', 'id_professor');
    }

    // Relação: Uma disciplina está em muitas turmas
    public function turmas()
    {
        return $this->belongsToMany(Turma::class, 'disciplina_turma', 'id_disciplina', 'id_turma');
    }
}