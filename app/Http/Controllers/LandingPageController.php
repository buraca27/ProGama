<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LandingPageContent;
use Inertia\Inertia;

class LandingPageController extends Controller
{
    //
    public function index()
    {
        $conteudo = LandingPageContent::first()->conteudo;

       return Inertia::render('LandingPage/LandingPage', [
            'conteudo' => $conteudo,
        ]);
    }

     public function edit()
    {
        $conteudo = LandingPageContent::first()->conteudo;

        return Inertia::render('LandingPage/assets/AdminLandingEditor', [
            'conteudo' => $conteudo,
        ]);
    }

    public function update(Request $request)
    {
        $landing = LandingPageContent::first();
        $landing->conteudo = $request->all();
        $landing->save();

        return back();
    }
}
