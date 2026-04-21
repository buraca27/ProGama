<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Models\Turma;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

    $listaUtilizadores = User::orderBy('created_at', 'desc')->get()->map(function ($u) use ($request) {
    return [
        'id' => $u->id,
        'name' => $u->name,
        'email' => $u->email,
        'id_role' => $u->id_role,
        'foto_perfil' => $u->foto_perfil,
        'created_at' => $u->created_at,
        'email_pessoal' => $u->email_pessoal,

        'can' => [
            'delete' => $request->user()->can('delete', $u),
        ]
    ];
});

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


// --- 3. GESTÃO DE UTILIZADORES E 4. TURMAS ---
// Descomentei esta linha para proteger as rotas de novo!
Route::middleware(['auth', 'admin'])->group(function () {

    // CRIAR
    Route::post('/dashboard/utilizadores', function (Request $request) {
        // ... (o teu código de criar utilizador fica igual) ...
    })->name('utilizadores.store');

    // EDITAR UTILIZADOR
    Route::put('/dashboard/utilizadores/{id}', function (Request $request, $id) {
        $request->validate(['name' => 'required|string|max:255', 'role' => 'required|integer|in:1,2,3']);
        User::findOrFail($id)->update(['name' => $request->name, 'id_role' => $request->role]);

        return redirect()->route('dashboard')->with('success', 'Utilizador editado com sucesso.');
    })->name('utilizadores.update');

    // APAGAR UTILIZADOR E REMOVER DO CPANEL (Agora ligado ao Controller como falámos!)
    Route::delete('/dashboard/utilizadores/{user}', [UserController::class, 'destroy'])->name('utilizadores.destroy');


    // --- 4. GESTÃO DE TURMAS ---
    Route::post('/dashboard/turmas', function (Request $request) {
        $validated = $request->validate(['nome' => 'required|string|max:100', 'ano_letivo' => 'required|string|max:20']);
        Turma::create($validated);
        return redirect()->route('dashboard')->with('success', 'Turma criada.');
    })->name('turmas.store');

    Route::put('/dashboard/turmas/{id}', function (Request $request, $id) {
        $validated = $request->validate(['nome' => 'required|string|max:100', 'ano_letivo' => 'required|string|max:20']);
        Turma::findOrFail($id)->update($validated);
        return redirect()->route('dashboard')->with('success', 'Turma atualizada.');
    })->name('turmas.update');

    Route::delete('/dashboard/turmas/{id}', function (Request $request, $id) {
        Turma::findOrFail($id)->delete();
        return redirect()->route('dashboard')->with('success', 'Turma apagada.');
    })->name('turmas.destroy');

    Route::post('/dashboard/turmas/{id}/assign', function (Request $request, $id) {
        // ... (o teu código de assign fica igual) ...
        return redirect()->route('dashboard')->with('success', 'Atribuições guardadas!');
    })->name('turmas.assign');

}); // <-- ESTA CHAVETA FECHA O GRUPO DE SEGURANÇA! (Adiciona-a aqui antes do perfil)

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
