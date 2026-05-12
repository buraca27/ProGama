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
        return $this->hasMany(Teste::class, 'id_categoria')
            ->where('tipo_avaliacao', 'Desafio');
    }

    public function testes(): HasMany
    {
        return $this->hasMany(Teste::class, 'id_categoria')
            ->where('tipo_avaliacao', '!=', 'Desafio');
    }
}
