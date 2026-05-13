<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingPageContent extends Model
{
    protected $table = 'landing_content';

    protected $fillable = ['conteudo'];

    protected $casts = [
        'conteudo' => 'array'
        ];
}
