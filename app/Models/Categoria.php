<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categoria extends Model
{
    use HasFactory;

    protected $table = 'Categorias';

    protected $fillable = [
        'nome',
        'descricao',
    ];

    public function desafios(): HasMany
    {
        return $this->hasMany(Desafio::class, 'id_categoria')
            ->where('tipo_desafio', 'Tarefa');
    }

    public function testes(): HasMany
    {
        return $this->hasMany(Desafio::class, 'id_categoria')
            ->where('tipo_desafio', 'Quiz');
    }
}
