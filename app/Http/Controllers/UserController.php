<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Hash, Mail, Http, Log};
use Illuminate\Support\Facades\Password;

class UserController extends Controller
{
    /**
     * CRIAÇÃO DE UTILIZADOR
     */
    public function store(Request $request)
    {
        Log::info("--- NOVO PEDIDO DE CRIAÇÃO ---");
        Log::info("Dados recebidos:", $request->all());

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|string|in:aluno,professor,secretaria',
            'password' => 'required|string|min:10',
            'nif' => 'required|string|size:9|unique:users',
            'data_nascimento' => 'required|date',
            'email_pessoal' => 'nullable|email',
            'foto_perfil' => 'nullable|string',
        ]);

        $roleId = match ($request->role) {
            'professor' => 2,
            'secretaria' => 1,
            default => 3
        };

        $emailFormatado = strtolower(trim($request->email));
        $password = $request->password;

        try {
            DB::beginTransaction();

            // 1. Gravação na Base de Dados (Incluindo a Foto)
            DB::table('users')->insert([
                'name' => $request->name,
                'email' => $emailFormatado,
                'email_pessoal' => strtolower($request->email_pessoal ?? null),
                'nmr_processo_interno' => $request->numero_interno,
                'nif' => $request->nif,
                'data_nascimento' => $request->data_nascimento,
                'password' => Hash::make($password),
                'id_role' => $roleId,
                'id_nivel' => 1,
                'foto_perfil' => $request->foto_perfil,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 2. Criação no Host (cPanel)
            // Chamamos apenas uma vez para evitar duplicados
            $this->manageCPanel($emailFormatado, $password, 'add_pop');

            DB::commit();

            // 3. Envio de Email de Boas-vindas
            // O travão interno na função impede o envio se o email_pessoal for null
            $this->sendWelcomeEmail($request, $password);

            return redirect()->route('dashboard')->with('success', 'Utilizador criado com sucesso.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erro crítico ao criar utilizador: " . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Falha ao criar conta: ' . $e->getMessage()
            ]);
        }
    }

/**
     * EDIÇÃO DE UTILIZADOR
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email_pessoal' => 'nullable|email|max:255',
            'nmr_processo_interno' => 'nullable|max:50', 
            'nif' => 'required|string|size:9|unique:users,nif,' . $user->id,
            'data_nascimento' => 'required|date',
            'id_role' => 'required|integer|in:1,2,3',
            'id_turma' => 'nullable|exists:Turmas,id', 
            'foto_perfil' => 'nullable|string'
        ]);

        // REGRA: O utilizador não pode alterar o seu próprio cargo
        if (auth()->id() == $user->id && $request->id_role != $user->id_role) {
            return redirect()->back()->withErrors([
                'error' => 'Ação negada: Não podes alterar o teu próprio cargo.'
            ]);
        }

        $user->update([
            'name' => $request->name,
            // Proteção adicionada para evitar erro caso o email pessoal venha nulo
            'email_pessoal' => $request->email_pessoal ? strtolower($request->email_pessoal) : null,
            'nmr_processo_interno' => $request->nmr_processo_interno,
            'nif' => $request->nif,
            'data_nascimento' => $request->data_nascimento,
            'id_role' => $request->id_role,
            'id_turma' => $request->id_role == 3 ? $request->id_turma : null,
            'foto_perfil' => $request->foto_perfil ?? $user->foto_perfil,
        ]);

        return redirect()->route('dashboard')->with('success', 'Utilizador atualizado com sucesso.');
    }

    /**
     * ELIMINAÇÃO DE UTILIZADOR
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // REGRA: Não permitir apagar o último administrador do sistema
        if ($user->id_role == 1 && User::where('id_role', 1)->count() <= 1) {
            return redirect()->back()->withErrors([
                'error' => 'Ação negada: Não é possível apagar o último administrador do sistema.'
            ]);
        }

        // Notifica e remove do Host antes de apagar da BD
        $this->sendTerminationEmail($user);
        $this->manageCPanel($user->email, null, 'delete_pop');

        $user->delete();

        return redirect()->route('dashboard')->with('success', 'Utilizador apagado definitivamente.');
    }

    /**
     * COMUNICAÇÃO COM O CPANEL (HOST)
     */
    private function manageCPanel($email, $password, $function)
    {
        $emailUser = explode('@', $email)[0];
        $domain = trim(env('CPANEL_DOMAIN'));

        Log::info("A tentar $function no cPanel para: " . $email);

        try {
            $response = Http::withoutVerifying()
                ->withBasicAuth(env('CPANEL_USER'), env('CPANEL_PASS'))
                ->get("https://{$domain}:2083/execute/Email/{$function}", [
                    'email' => $emailUser,
                    'password' => $password,
                    'domain' => $domain,
                    'quota' => 500,
                ]);

            Log::info("Resposta Host ($function): " . $response->body());
        } catch (\Exception $e) {
            Log::error("Erro crítico no Host ($function): " . $e->getMessage());
        }
    }

    /**
     * EMAIL DE BOAS-VINDAS
     */
    private function sendWelcomeEmail($request, $password)
    {
        // TRAVÃO DE SEGURANÇA: Se não houver email pessoal, aborta o envio
        if (empty($request->email_pessoal)) {
            Log::info("Email de boas-vindas ignorado: Sem endereço pessoal definido.");
            return;
        }

        $htmlContent = <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; background-color: #f0f4f8; padding: 40px 10px;">
            <div style="background-color: #ffffff; border-radius: 16px; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 30px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">Bem-vindo ao ProGama! 🚀</h2>
                </div>
                <div style="padding: 40px 30px;">
                    <p>Olá, <strong>{$request->name}</strong>!</p>
                    <p>A tua conta institucional foi criada. Aqui estão os teus dados de acesso:</p>
                    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 25px; margin: 20px 0;">
                        <span style="font-size: 11px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Email Institucional</span>
                        <div style="font-size: 18px; font-weight: bold; color: #1e293b; margin-bottom: 15px;">{$request->email}</div>
                        <span style="font-size: 11px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Password Provisória</span>
                        <div style="background: white; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; text-align: center;">
                            <code style="font-size: 20px; color: #2563eb; font-weight: bold;">{$password}</code>
                        </div>
                    </div>
                    <p style="font-size: 13px; color: #64748b;">Dica: Altera a tua password após o primeiro login.</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://progama.pt" style="background-color: #2563eb; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Entrar no Workspace</a>
                    </div>
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
            Log::error('Erro Mail Boas-vindas: ' . $e->getMessage());
        }
    }


    /**
     * ENVIAR PEDIDO DE RESET DE PASSWORD (INDIVIDUAL)
     */
    public function sendPasswordReset($id)
    {
        $user = User::findOrFail($id);

        if (empty($user->email_pessoal)) {
            return redirect()->back()->withErrors([
                'error' => "Ação negada: O utilizador {$user->name} não tem email pessoal configurado."
            ]);
        }

        // Gera o token oficial do Laravel para reset de password
        $token = Password::broker()->createToken($user);
        $this->sendCustomResetEmail($user, $token);

        return redirect()->route('dashboard')->with('success', "Pedido de reset enviado para o email pessoal de {$user->name}.");
    }

    /**
     * 
     * 
     * /**
     * EMAIL CUSTOMIZADO DE RESET (ENVIADO PARA EMAIL PESSOAL)
     */
    private function sendCustomResetEmail($user, $token)
    {
        // Cria a hiperligação para a página de reset de password do site
        $resetLink = route('password.reset', ['token' => $token, 'email' => $user->email]);

        $htmlContent = <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; background-color: #f0f4f8; padding: 40px 10px;">
            <div style="background-color: #ffffff; border-radius: 16px; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 30px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">Recuperação de Password 🔒</h2>
                </div>
                <div style="padding: 40px 30px;">
                    <p>Olá, <strong>{$user->name}</strong>!</p>
                    <p>A secretaria do ProGama solicitou a redefinição da tua password.</p>
                    <p>Clica no botão abaixo para escolher uma nova password segura:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{$resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Redefinir Password</a>
                    </div>
                    <p style="font-size: 13px; color: #64748b;">Conta Institucional: <strong>{$user->email}</strong></p>
                    <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">Se não pediste ou não estavas à espera disto, podes ignorar o email. Este link expira automaticamente em 60 minutos.</p>
                </div>
            </div>
        </body>
        </html>
HTML;

        try {
            Mail::html($htmlContent, function ($msg) use ($user) {
                $msg->to($user->email_pessoal, $user->name)
                    ->subject('🔒 ProGama: Redefinição de Password');
            });
        } catch (\Exception $e) {
            Log::error('Erro ao enviar pedido de reset para o email pessoal: ' . $e->getMessage());
        }
    }

     /**
     * EMAIL DE ENCERRAMENTO
     */
    private function sendTerminationEmail($user)
    {
        // TRAVÃO DE SEGURANÇA
        if (empty($user->email_pessoal))
            return;

        $htmlContent = <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; background-color: #f0f4f8; padding: 40px 10px;">
            <div style="background-color: #ffffff; border-radius: 16px; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%); padding: 30px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">Aviso de Encerramento 🚨</h2>
                </div>
                <div style="padding: 40px 30px; text-align: center;">
                    <p>Olá, <strong>{$user->name}</strong>.</p>
                    <p>Informamos que a tua conta institucional foi encerrada definitivamente pela Secretaria.</p>
                    <div style="margin: 30px 0; background-color: #fef2f2; border: 2px dashed #fca5a5; padding: 20px; border-radius: 12px;">
                        <span style="color: #ef4444; font-weight: bold;">CONTA DESATIVADA</span>
                        <div style="text-decoration: line-through; color: #7f1d1d; font-size: 18px;">{$user->email}</div>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8;">&copy; 2026 ProGama</p>
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
            Log::error('Erro Mail Encerramento: ' . $e->getMessage());
        }
    }
}
