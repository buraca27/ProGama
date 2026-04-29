<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Categoria extends Model
{
    use HasFactory;
    protected $table = 'Categorias';
    public $timestamps = false;

    protected $fillable = [
        'nome',
        'descricao',
    ];

    public function desafios()
    {
        return $this->hasMany(Desafio::class, 'id_categoria');
    }

    public function testes()
    {
        return $this->hasMany(Teste::class, 'id_categoria');
    }
}
