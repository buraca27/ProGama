<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Inertia\Inertia;

// --- 1. LANDING PAGE ---
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});
$logoUrl = asset('images/icone.png');

// --- 2. DASHBOARD ---
Route::get('/dashboard', function (Request $request) {
    $user = $request->user();

    $listaUtilizadores = DB::table('users')->orderBy('created_at', 'desc')->get();

    $estatisticas = [
        'total_users'    => DB::table('users')->count(),
        'total_turmas'   => tryCatchCount('Turmas'),
        'total_desafios' => tryCatchCount('Desafios'),
    ];

    $roleMap  = [1 => 'admin', 2 => 'professor', 3 => 'aluno'];
    $cargoReal = $roleMap[$user->id_role] ?? 'admin';

    return Inertia::render('Dashboard', [
        'userRoleReal' => $cargoReal,
        'estatisticas' => $estatisticas,
        'utilizadores' => $listaUtilizadores,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// --- 3. GESTÃO DE UTILIZADORES E CPANEL (POST) ---
Route::post('/dashboard/utilizadores', function (Request $request) {

    // 1. Validação PRIMEIRO (sempre)
    $request->validate([
        'name'           => 'required|string|max:255',
        'email'          => 'required|string|email|max:255|unique:users',
        'role'           => 'required|string|in:aluno,professor,secretaria',
        'password'       => 'required|string|min:10',
        'numero_interno' => 'nullable|string|max:50',
        'email_pessoal'  => 'nullable|email|max:255',
    ]);

    // 2. Preparar dados
    $passwordPadrao = $request->input('password');
    $roleId = match ($request->role) {
        'professor'  => 2,
        'secretaria' => 1,
        default      => 3,
    };

    // 3. Gravar no MySQL
    DB::table('users')->insert([
        'name'       => $request->name,
        'email'      => strtolower($request->email),
        'password'   => Hash::make($passwordPadrao),
        'id_role'    => $roleId,
        'id_nivel'   => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // 4. Criar conta no cPanel
    $emailUser = explode('@', $request->email)[0];
    $domain    = trim(env('CPANEL_DOMAIN'));
    $cpanelOk  = true;

    try {
        $response = Http::withoutVerifying()
            ->withBasicAuth(env('CPANEL_USER'), env('CPANEL_PASS'))
            ->get("https://{$domain}:2083/execute/Email/add_pop", [
                'email'    => $emailUser,
                'password' => $passwordPadrao,
                'domain'   => $domain,
                'quota'    => 500,
            ]);

        $errors = $response->json()['errors'] ?? null;

        if ($response->failed() || $errors) {
            $cpanelOk = false;
            \Log::error('Erro cPanel add_pop: ' . $response->body());
        }
    } catch (\Exception $e) {
        $cpanelOk = false;
        \Log::error('Falha ligação cPanel: ' . $e->getMessage());
    }

    // 5. Enviar email pessoal com credenciais (se fornecido)
    if ($request->filled('email_pessoal')) {
        $logoUrl = asset('images/icone.png');
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
                    <h2 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: -0.5px;">{ $logoUrl } Bem-vindo ao ProGama! </h2>
                </div>
                
                <div style="padding: 40px 30px;">
                    <p style="color: #475569; font-size: 17px; line-height: 1.6; margin-top: 0;">Olá, <strong>{$request->name}</strong>!</p>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">A tua conta institucional está pronta. Criámos um acesso seguro para ti. Podes copiar a tua password temporária abaixo:</p>

                    <div style="margin: 30px 0; background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 25px;">
                        
                        <div style="margin-bottom: 20px;">
                            <span style="display: block; color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px;">Email Institucional</span>
                            <div style="color: #1e293b; font-size: 18px; font-weight: 600; word-break: break-all;">
                                {$request->email}
                            </div>
                        </div>

                        <div>
                            <span style="display: block; color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px;">Password Provisória</span>
                            <div style="position: relative; background-color: #ffffff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center;">
                                <code style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: bold; color: #2563eb; letter-spacing: 2px; -webkit-user-select: all; user-select: all;">{$passwordPadrao}</code>
                                
                                <p style="margin: 10px 0 0 0; color: #64748b; font-size: 11px;">
                                    💡 <strong>Dica:</strong> Dá um duplo clique em cima da password para a selecionares inteira.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 35px;">
                        <a href="https://progama.pt" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">Entrar no Workspace</a>
                    </div>

                    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 40px; border-radius: 4px;">
                        <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
                            <strong>Segurança Primeiro:</strong> Esta password é gerada automaticamente. Ser-te-á pedido para a alterares assim que entrares na plataforma pela primeira vez.
                        </p>
                    </div>
                </div>

                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 ProGama - Educação Tecnológica</p>
                </div>
            </div>
        </body>
        </html>
        HTML;

        \Mail::html($htmlContent, function ($msg) use ($request) {
            $msg->to($request->email_pessoal, $request->name)
                ->subject('🔑 Credenciais ProGama: ' . $request->name);
        });
    }

    // 6. Redirecionar
    $msg = $cpanelOk
        ? 'Utilizador e Email criados com sucesso.'
        : 'Utilizador criado, mas falhou a criação do email no cPanel. Verifica o log.';

    return redirect()->route('dashboard')->with('success', $msg);
})->middleware(['auth'])->name('utilizadores.store');

// --- 4. ROTA DE SEGURANÇA ---
Route::get('/dashboard/utilizadores', function () {
    return redirect()->route('dashboard');
})->middleware(['auth']);

// --- 5. ROTAS DE PERFIL E AUTH ---
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

// --- FUNÇÃO AUXILIAR ---
function tryCatchCount($table)
{
    try {
        return DB::table($table)->count();
    } catch (\Exception $e) {
        return 0;
    }
}
