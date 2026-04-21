<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{

   public function index(Request $request)
    {

        Gate::authorize('viewList', User::class);


        $users = User::all()->map(function ($user) use ($request) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'id_role' => $user->id_role,


                'can' => [
                    'update' => $request->user()->can('update', $user),
                    'delete' => $request->user()->can('delete', $user),
                ]
            ];
        });


        return response()->json(['users' => $users]);
    }


    public function destroy(User $user)
    {
        // 1. A BARREIRA DA POLICY (Se for o último admin, o código para aqui e devolve erro 403!)
        Gate::authorize('delete', $user);

        $emailInstitucional = $user->email;
        $emailPessoal = $user->email_pessoal;

        // 2. ENVIAR EMAIL DE AVISO (Código que estava nas rotas)
        if (!empty($emailPessoal)) {
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
                            <div style="margin-bottom: 0;">
                                <span style="display: block; color: #ef4444; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px;">Email Apagado</span>
                                <div style="color: #7f1d1d; font-size: 18px; font-weight: 600; word-break: break-all; text-decoration: line-through;">
                                    {$emailInstitucional}
                                </div>
                            </div>
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
                \Illuminate\Support\Facades\Mail::html($htmlContent, function ($msg) use ($emailPessoal, $user) {
                    $msg->to($emailPessoal, $user->name)
                        ->subject('🚨 ProGama: A tua conta foi encerrada');
                });
            } catch (\Exception $e) {
                \Log::error('Erro ao enviar email de apagamento: ' . $e->getMessage());
            }
        }

        // 3. APAGAR DO CPANEL
        $emailUser = explode('@', $emailInstitucional);
        $domain = trim(env('CPANEL_DOMAIN'));
        try {
            \Illuminate\Support\Facades\Http::withoutVerifying()
                ->withBasicAuth(env('CPANEL_USER'), env('CPANEL_PASS'))
                ->get("https://{$domain}:2083/execute/Email/delete_pop", [
                    'email' => $emailUser,
                    'domain' => $domain,
                ]);
        } catch (\Exception $e) {
            \Log::error('Erro cPanel ao apagar: ' . $e->getMessage());
        }

        // 4. APAGAR DA BASE DE DADOS
        $user->delete();

        // 5. DEVOLVER RESPOSTA
        return redirect()->route('dashboard')->with('success', 'Conta apagada com sucesso!');
    }


}

