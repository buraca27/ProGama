<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TwoFactorController extends Controller
{
    public function index(Request $request)
    {
        // Se bater nesta rota sem ter tentado fazer login antes
        if (!$request->session()->has('2fa_user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/Verify2FA');
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ], [
            'code.required' => 'O código é obrigatório.',
            'code.size' => 'O código tem de ter exatamente 6 dígitos.'
        ]);

        $userId = $request->session()->get('2fa_user_id');
        $user = User::find($userId);

        // Validação de segurança: Existe? O código é igual? Já passou do tempo?
        if (!$user || $user->twofa_code !== $request->code || now()->greaterThan($user->twofa_expires)) {
            return back()->withErrors([
                'code' => 'O código fornecido está incorreto ou já expirou.',
            ]);
        }

        // Se passar, limpa os dados 2FA da DB
        $user->update([
            'twofa_code' => null,
            'twofa_expires' => null
        ]);

        // Faz o login final no sistema
        Auth::login($user, $request->session()->get('2fa_remember', false));
        
        // Limpa as variáveis temporárias da sessão
        $request->session()->forget(['2fa_user_id', '2fa_remember']);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}