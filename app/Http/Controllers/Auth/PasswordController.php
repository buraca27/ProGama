<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use App\Services\CPanelService;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request, CPanelService $cpanelService): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user = $request->user();

        // 1. Atualiza na Base de Dados do ProGama
        $user->update([
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
        ]);

        // 2. Atualiza no Host (Webmail/cPanel) usando o novo Service
        $cpanelService->changePassword($user->email, $validated['password']);

        return back()->with('status', 'password-updated');
    }

    /**
     * Sincroniza a password com o cPanel usando passwd_pop
     */
    private function syncPasswordWithCPanel($email, $newPassword)
    {
        $emailUser = explode('@', $email)[0];
        $domain = trim(env('CPANEL_DOMAIN'));

        Log::info("A tentar sincronizar password no cPanel para: " . $email);

        try {
            $response = Http::withoutVerifying()
                ->withBasicAuth(env('CPANEL_USER'), env('CPANEL_PASS'))
                ->get("https://{$domain}:2083/execute/Email/passwd_pop", [
                    'email' => $emailUser,
                    'password' => $newPassword,
                    'domain' => $domain,
                ]);

            if ($response->successful()) {
                Log::info("Sincronização cPanel com sucesso para: " . $email);
            } else {
                Log::error("Falha na sincronização cPanel: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Erro crítico ao sincronizar password no Host: " . $e->getMessage());
        }
    }
}