<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Turma;
use App\Models\User;

// --- 1. LANDING PAGE ---
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// --- 2. DASHBOARD ---
Route::get('/dashboard', function (Request $request) {
    $user = clone $request->user();

    $listaUtilizadores = DB::table('users')->orderBy('created_at', 'desc')->get();

    $estatisticas = [
        'total_users' => DB::table('users')->count(),
        'total_turmas' => tryCatchCount('Turmas'),
        'total_desafios' => tryCatchCount('Desafios'),
    ];

    $roleMap = [1 => 'admin', 2 => 'professor', 3 => 'aluno'];
    $cargoReal = $roleMap[$user->id_role] ?? 'admin';

    $turmas = [];
    if ($user->id_role === 1) {
        $turmas = Turma::with(['professores', 'alunos'])->get();
    } elseif ($user->id_role === 2) {
        $turmas = User::find($user->id)->turmasLecionadas()->with(['alunos', 'professores'])->get();
    } elseif ($user->id_role === 3) {
        if ($user->id_turma) {
            $turmas = Turma::where('id', $user->id_turma)->with(['professores', 'alunos'])->get();
        }
    }

    return Inertia::render('Dashboard', [
        'userRoleReal' => $cargoReal,
        'estatisticas' => $estatisticas,
        'utilizadores' => $listaUtilizadores,
        'turmas' => $turmas,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// --- 3. GESTÃO DE UTILIZADORES (CRIAR, EDITAR, APAGAR) ---
Route::middleware(['auth', 'admin'])->group(function () {
// CRIAR
Route::post('/dashboard/utilizadores', function (Request $request) {
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'role' => 'required|string|in:aluno,professor,secretaria',
        'password' => 'required|string|min:10',
        'numero_interno' => 'nullable|integer',
        'email_pessoal' => 'nullable|email|max:255',
        'foto_perfil' => 'nullable|string',
    ]);

    $passwordPadrao = $request->input('password');
    $roleId = match ($request->role) { 'professor' => 2, 'secretaria' => 1, default => 3};

    DB::table('users')->insert([
        'name' => $request->name,
        'email' => strtolower($request->email),
        'email_pessoal' => $request->filled('email_pessoal') ? strtolower($request->email_pessoal) : null,
        'nmr_processo_interno' => $request->numero_interno,
        'foto_perfil' => $request->foto_perfil,
        'password' => Hash::make($passwordPadrao),
        'id_role' => $roleId,
        'id_nivel' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // ENVIAR EMAIL (CRIAR)
    if ($request->filled('email_pessoal')) {
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

        try {
            Mail::html($htmlContent, function ($msg) use ($request) {
                $msg->to($request->email_pessoal, $request->name)
                    ->subject('🔑 Credenciais ProGama: ' . $request->name);
            });
        } catch (\Exception $e) {
            \Log::error('Erro ao enviar email de criacao: ' . $e->getMessage());
        }
    }

    // Criar no cPanel
    $emailUser = explode('@', $request->email)[0];
    $domain = trim(env('CPANEL_DOMAIN'));
    try {
        Http::withoutVerifying()
            ->withBasicAuth(env('CPANEL_USER'), env('CPANEL_PASS'))
            ->get("https://{$domain}:2083/execute/Email/add_pop", [
                'email' => $emailUser,
                'password' => $passwordPadrao,
                'domain' => $domain,
                'quota' => 500,
            ]);
    } catch (\Exception $e) {
        \Log::error('Erro cPanel criacao: ' . $e->getMessage());
    }

    return redirect()->route('dashboard')->with('success', 'Utilizador criado com sucesso.');
})->name('utilizadores.store');

// EDITAR UTILIZADOR
Route::put('/dashboard/utilizadores/{id}', function (Request $request, $id) {
    $request->validate(['name' => 'required|string|max:255', 'role' => 'required|integer|in:1,2,3']);
    User::findOrFail($id)->update(['name' => $request->name, 'id_role' => $request->role]);

    return redirect()->route('dashboard')->with('success', 'Utilizador editado com sucesso.'); // CORRIGIDO PARA EVITAR 404
})->name('utilizadores.update');

// APAGAR UTILIZADOR E REMOVER DO CPANEL
Route::delete('/dashboard/utilizadores/{id}', function (Request $request, $id) {
    $user = User::findOrFail($id);
    $emailInstitucional = $user->email;
    $emailPessoal = $user->email_pessoal;

    // ENVIAR EMAIL (APAGAR)
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
            Mail::html($htmlContent, function ($msg) use ($emailPessoal, $user) {
                $msg->to($emailPessoal, $user->name)
                    ->subject('🚨 ProGama: A tua conta foi encerrada');
            });
        } catch (\Exception $e) {
            \Log::error('Erro ao enviar email de apagamento: ' . $e->getMessage());
        }
    }

    // Apagar do cPanel
    $emailUser = explode('@', $emailInstitucional)[0];
    $domain = trim(env('CPANEL_DOMAIN'));
    try {
        Http::withoutVerifying()
            ->withBasicAuth(env('CPANEL_USER'), env('CPANEL_PASS'))
            ->get("https://{$domain}:2083/execute/Email/delete_pop", [
                'email' => $emailUser,
                'domain' => $domain,
            ]);
    } catch (\Exception $e) {
        \Log::error('Erro cPanel ao apagar: ' . $e->getMessage());
    }

    $user->delete();

    return redirect('/dashboard')->with('success', 'Utilizador e email apagados com sucesso.');
})->name('utilizadores.destroy');

// --- 4. GESTÃO DE TURMAS ---
Route::post('/dashboard/turmas', function (Request $request) {
    $validated = $request->validate(['nome' => 'required|string|max:100', 'ano_letivo' => 'required|string|max:20']);
    $turma = Turma::create($validated);

    return redirect()->route('dashboard')->with('success', 'Turma criada.'); // CORRIGIDO PARA EVITAR 404
})->name('turmas.store');

Route::put('/dashboard/turmas/{id}', function (Request $request, $id) {
    $validated = $request->validate(['nome' => 'required|string|max:100', 'ano_letivo' => 'required|string|max:20']);
    Turma::findOrFail($id)->update($validated);

    return redirect()->route('dashboard')->with('success', 'Turma atualizada.'); // CORRIGIDO PARA EVITAR 404
})->name('turmas.update');

Route::delete('/dashboard/turmas/{id}', function (Request $request, $id) {
    Turma::findOrFail($id)->delete();

    return redirect()->route('dashboard')->with('success', 'Turma apagada.'); // CORRIGIDO PARA EVITAR 404
})->name('turmas.destroy');

Route::post('/dashboard/turmas/{id}/assign', function (Request $request, $id) {
    $turma = Turma::findOrFail($id);
    User::where('id_turma', $turma->id)->update(['id_turma' => null]);
    if ($request->has('alunos_ids') && is_array($request->alunos_ids)) {
        User::whereIn('id', $request->alunos_ids)->update(['id_turma' => $turma->id]);
    }
    if ($request->has('professores_ids') && is_array($request->professores_ids)) {
        $turma->professores()->sync($request->professores_ids);
    } else {
        $turma->professores()->sync([]);
    }

    return redirect()->route('dashboard')->with('success', 'Atribuições guardadas!'); // CORRIGIDO PARA EVITAR 404
})->name('turmas.assign');
});

// --- 5. ROTAS DE PERFIL E AUTH ---
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

function tryCatchCount($table)
{
    try {
        return DB::table($table)->count();
    } catch (\Exception $e) {
        return 0;
    }
}
