<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Atualiza as informações do perfil.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        // Redireciona de volta para o Dashboard mantendo a vista atual
        return back()->with('success', 'Perfil atualizado com sucesso.');
    }

    /**
     * Ligar / Desligar o 2FA via Email
     */
    public function toggle2FA(Request $request)
    {
        $user = $request->user();
        $novoEstado = !$user->twofa_totp_enabled;

        $user->update([
            'twofa_totp_enabled' => $novoEstado,
            'twofa_code' => null,
            'twofa_expires' => null,
        ]);

        $mensagem = $novoEstado
            ? 'Autenticação de Dois Fatores (2FA) foi ativada com sucesso.'
            : 'Autenticação de Dois Fatores (2FA) foi desativada.';

        return back()->with('success', $mensagem);
    }
    
    /**
     * Eliminar a conta do utilizador.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}