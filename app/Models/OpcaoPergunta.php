<?php

namespace App\Models;

use App\Models\Pergunta;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpcaoPergunta extends Model
{
    use HasFactory;

    protected $table = 'Opcoes_Pergunta';

    protected $fillable = [
        'id_pergunta',
        'texto_opcao',
        'is_correct',
    ];

    public function pergunta()
    {
        return $this->belongsTo(Pergunta::class, 'id_pergunta');
    }
}
