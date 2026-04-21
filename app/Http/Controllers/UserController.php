<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Hash, Mail, Http, Log};

class UserController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|string|in:aluno,professor,secretaria',
            'password' => 'required|string|min:10',
        ]);

        $roleId = match ($request->role) {
            'professor' => 2,
            'secretaria' => 1,
            default => 3
        };

        DB::table('users')->insert([
            'name' => $request->name,
            'email' => strtolower($request->email),
            'email_pessoal' => strtolower($request->email_pessoal),
            'nmr_processo_interno' => $request->numero_interno,
            'password' => Hash::make($request->password),
            'id_role' => $roleId,
            'id_nivel' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->sendWelcomeEmail($request);
        $this->manageCPanel($request->email, $request->password, 'add_pop');

        return redirect()->route('dashboard')->with('success', 'Utilizador criado com sucesso.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|integer|in:1,2,3'
        ]);

        User::findOrFail($id)->update([
            'name' => $request->name,
            'id_role' => $request->role
        ]);

        return redirect()->route('dashboard')->with('success', 'Utilizador editado.');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        $this->sendTerminationEmail($user);
        $this->manageCPanel($user->email, null, 'delete_pop');

        $user->delete();

        return redirect()->route('dashboard')->with('success', 'Utilizador apagado.');
    }

    // Métodos Privados para Limpeza de Código
    private function manageCPanel($email, $password, $function)
    {
        $emailUser = explode('@', $email)[0];
        $domain = trim(env('CPANEL_DOMAIN'));

        try {
            Http::withoutVerifying()
                ->withBasicAuth(env('CPANEL_USER'), env('CPANEL_PASS'))
                ->get("https://{$domain}:2083/execute/Email/{$function}", [
                    'email' => $emailUser,
                    'password' => $password,
                    'domain' => $domain,
                    'quota' => 500,
                ]);
        } catch (\Exception $e) {
            Log::error("Erro cPanel ($function): " . $e->getMessage());
        }
    }

    private function sendWelcomeEmail($request, $password)
    {
        $htmlContent = <<<HTML
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 10px;">
        <div style="background-color: #ffffff; padding: 0; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); overflow: hidden; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 30px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: -0.5px;">Bem-vindo ao ProGama! </h2>
            </div>
            <div style="padding: 40px 30px;">
                <p style="color: #475569; font-size: 17px; line-height: 1.6; margin-top: 0;">Olá, <strong>{$request->name}</strong>!</p>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">A tua conta institucional está pronta. Criámos um acesso seguro para ti. Podes copiar a tua password temporária abaixo:</p>
                <div style="margin: 30px 0; background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 25px;">
                    <div style="margin-bottom: 20px;">
                        <span style="display: block; color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px;">Email Institucional</span>
                        <div style="color: #1e293b; font-size: 18px; font-weight: 600; word-break: break-all;">{$request->email}</div>
                    </div>
                    <div>
                        <span style="display: block; color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px;">Password Provisória</span>
                        <div style="position: relative; background-color: #ffffff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center;">
                            <code style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: bold; color: #2563eb; letter-spacing: 2px;">{$password}</code>
                            <p style="margin: 10px 0 0 0; color: #64748b; font-size: 11px;">💡 <strong>Dica:</strong> Dá um duplo clique em cima da password para a selecionares.</p>
                        </div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 35px;">
                    <a href="https://progama.pt" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 16px;">Entrar no Workspace</a>
                </div>
                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 40px; border-radius: 4px;">
                    <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;"><strong>Segurança Primeiro:</strong> Ser-te-á pedido para alterares a password no primeiro acesso.</p>
                </div>
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 ProGama - Educação Tecnológica</p>
            </div>
        </div>
    </body>
    </html>
HTML;

        try {
            Mail::html($htmlContent, function ($msg) use ($request) {
                $msg->to($request->email_pessoal, $request->name)
                    ->subject('🔑 Credenciais ProGama: ' . $request->name);
            });
        } catch (\Exception $e) {
            Log::error('Erro ao enviar email de criacao: ' . $e->getMessage());
        }
    }
    private function sendTerminationEmail($user)
    {
        $htmlContent = <<<HTML
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 10px;">
        <div style="background-color: #ffffff; padding: 0; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); overflow: hidden; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%); padding: 30px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: -0.5px;">Aviso de Encerramento</h2>
            </div>
            <div style="padding: 40px 30px;">
                <p style="color: #475569; font-size: 17px; line-height: 1.6; margin-top: 0;">Olá, <strong>{$user->name}</strong>.</p>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">Este email serve para informar que a tua conta na plataforma ProGama foi terminada definitivamente pela Secretaria.</p>
                <div style="margin: 30px 0; background-color: #fef2f2; border: 2px dashed #fca5a5; border-radius: 12px; padding: 25px;">
                    <span style="display: block; color: #ef4444; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px;">Email Apagado</span>
                    <div style="color: #7f1d1d; font-size: 18px; font-weight: 600; text-decoration: line-through;">{$user->email}</div>
                </div>
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 ProGama - Educação Tecnológica</p>
            </div>
        </div>
    </body>
    </html>
HTML;

        try {
            Mail::html($htmlContent, function ($msg) use ($user) {
                $msg->to($user->email_pessoal, $user->name)
                    ->subject('🚨 ProGama: A tua conta foi encerrada');
            });
        } catch (\Exception $e) {
            Log::error('Erro ao enviar email de apagamento: ' . $e->getMessage());
        }
    }
}


