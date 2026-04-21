<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\{DB, Hash, Mail, Http, Log};

class UserController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewList', User::class);

        $users = User::orderBy('created_at', 'desc')->get()->map(function ($user) use ($request) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'id_role' => $user->id_role,
                'foto_perfil' => $user->foto_perfil,
                'created_at' => $user->created_at,
                'email_pessoal' => $user->email_pessoal,
                'can' => [
                    'update' => $request->user()->can('update', $user),
                    'delete' => $request->user()->can('delete', $user),
                ],
            ];
        });

        return response()->json(['users' => $users]);
    }

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
            'email_pessoal' => 'nullable|email',
            'foto_perfil' => 'nullable|string', // Validação para a string Base64
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
                'password' => Hash::make($password),
                'id_role' => $roleId,
                'id_nivel' => 1,
                'foto_perfil' => $request->foto_perfil, // Agora a foto é gravada!
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

        Gate::authorize('update', $user);

        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|integer|in:1,2,3'
        ]);

        $user->update([
            'name' => $request->name,
            'id_role' => $request->role
        ]);

        return redirect()->route('dashboard')->with('success', 'Utilizador editado.');
    }

    /**
     * ELIMINAÇÃO DE UTILIZADOR
     */
    public function destroy(User $user)
    {
        Gate::authorize('delete', $user);

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
