<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();

        // 1. Verifica se o 2FA está ativo para este utilizador
        if ($user->twofa_totp_enabled) {
            // Desloga temporariamente e guarda os dados na sessão
            Auth::guard('web')->logout();
            $request->session()->put('2fa_user_id', $user->id);
            $request->session()->put('2fa_remember', $request->boolean('remember'));

            // Gera código de 6 dígitos e validade de 10 minutos
            $code = (string) rand(100000, 999999);
            $user->update([
                'twofa_code' => $code,
                'twofa_expires' => now()->addMinutes(10)
            ]);

            // Envia o email com o código
            $this->send2FAEmail($user, $code);

            return redirect()->route('2fa.index');
        }

        // Se não tiver 2FA, faz o login normal
        $request->session()->regenerate();
        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Envia o Email com o Código 2FA usando o template ProGama
     */
    private function send2FAEmail($user, $code)
    {
        // Envia para o email institucional (ou pessoal, se preferires mudar para $user->email_pessoal)
        $emailDestino = $user->email; 

        $htmlContent = <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; background-color: #f0f4f8; padding: 40px 10px;">
            <div style="background-color: #ffffff; border-radius: 16px; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 30px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">Autenticação 2FA 🔐</h2>
                </div>
                <div style="padding: 40px 30px; text-align: center;">
                    <p>Olá, <strong>{$user->name}</strong>!</p>
                    <p>Para concluir o teu início de sessão no ProGama, introduz o seguinte código de segurança:</p>
                    
                    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 25px; margin: 30px 0;">
                        <span style="font-size: 11px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Código de Acesso</span>
                        <div style="font-size: 32px; font-weight: bold; color: #1e293b; letter-spacing: 5px; margin-top: 10px;">
                            {$code}
                        </div>
                    </div>
                    
                    <p style="font-size: 13px; color: #64748b;">Este código expira em 10 minutos. Se não tentaste iniciar sessão, altera imediatamente a tua password.</p>
                </div>
            </div>
        </body>
        </html>
HTML;

        try {
            Mail::html($htmlContent, function ($msg) use ($user, $emailDestino) {
                $msg->to($emailDestino, $user->name)
                    ->subject('🔐 ProGama: Código de Verificação 2FA');
            });
            Log::info("Email 2FA enviado com sucesso para: " . $emailDestino);
        } catch (\Exception $e) {
            Log::error('Erro ao enviar email de 2FA: ' . $e->getMessage());
        }
    }
}