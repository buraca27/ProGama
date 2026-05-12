<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TurmaController;
use App\Http\Controllers\DisciplinaController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\AlunoDesafioController;
use App\Http\Controllers\DesafioAlunoController;
use App\Http\Controllers\ProfessorTesteController;
use App\Http\Controllers\GamificationController;
use App\Http\Controllers\SocialController;
use App\Http\Controllers\NotificacaoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// --- 1. LANDING PAGE ---
Route::get('/', function () {
    return Inertia::render('LandingPage/LandingPage');
});

// --- 2. ÁREA AUTENTICADA ---
Route::middleware(['auth', 'verified', 'force_password_change'])->group(function () {
    // Dashboard Principal
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // --- 2.1. ÁREA PROFESSOR (PERGUNTAS / TESTES) ---
    Route::prefix('dashboard/professor')->name('professor.')->group(function () {
        Route::post('/perguntas', [ProfessorTesteController::class, 'storePergunta'])->name('perguntas.store');
        Route::put('/perguntas/{id}', [ProfessorTesteController::class, 'updatePergunta'])->name('perguntas.update');

        Route::post('/testes', [ProfessorTesteController::class, 'storeTeste'])->name('testes.store');
        Route::put('/testes/{id}', [ProfessorTesteController::class, 'updateTeste'])->name('testes.update');
        Route::post('/tarefas', [ProfessorTesteController::class, 'storeTarefa'])->name('tarefas.store');
        Route::put('/tarefas/{idTarefa}', [ProfessorTesteController::class, 'updateTarefa'])->name('tarefas.update');
        Route::post('/tarefas/{idTarefa}/terminar', [ProfessorTesteController::class, 'terminarTarefa'])->name('tarefas.terminar');
        Route::delete('/tarefas/{idTarefa}', [ProfessorTesteController::class, 'destroyTarefa'])->name('tarefas.destroy');
        Route::put('/correcoes/{idTesteRealizado}', [ProfessorTesteController::class, 'updateCorrecao'])->name('correcoes.update');
    });

    Route::prefix('dashboard/aluno')->name('aluno.')->group(function () {
        Route::post('/desafios/{idAtribuicao}/submeter', [AlunoDesafioController::class, 'submeter'])->name('desafios.submeter');
    });

    // --- 2.1.1. DESAFIOS UNIFICADOS ---
    Route::prefix('desafios')->name('desafios.')->group(function () {
        Route::get('/', [DesafioAlunoController::class, 'index'])->name('index');
        Route::get('/{desafio}', [DesafioAlunoController::class, 'show'])->name('show');
        Route::post('/{desafio}/iniciar-quiz', [DesafioAlunoController::class, 'iniciarQuiz'])->name('iniciar-quiz');
        Route::post('/{desafio}/submeter-quiz', [DesafioAlunoController::class, 'submeterQuiz'])->name('submeter-quiz');
        Route::post('/{desafio}/submeter-tarefa', [DesafioAlunoController::class, 'submeterTarefa'])->name('submeter-tarefa');
        Route::get('/{desafio}/historico', [DesafioAlunoController::class, 'historicoSubmissoes'])->name('historico');
    });

    // --- 2.2. SOCIAL ---

    Route::prefix('social')->name('social.')->group(function () {
        Route::get('/', [SocialController::class, 'index'])->name('hub');
        Route::post('/seguir/{usuario}', [SocialController::class, 'seguir'])->name('seguir');
        Route::delete('/seguir/{usuario}', [SocialController::class, 'deixarSeguir'])->name('deixar-seguir');
    });

    Route::prefix('notificacoes')->name('notificacoes.')->group(function () {
        Route::get('/', [NotificacaoController::class, 'index'])->name('index');
        Route::post('/ler-todas', [NotificacaoController::class, 'marcarTodasLidas'])->name('ler-todas');
        Route::post('/{notificacao}/ler', [NotificacaoController::class, 'marcarLida'])->name('ler');
    });

    Route::get('/perfil/publico/{usuario}', [GamificationController::class, 'perfilPublico'])->name('perfil.publico');

    // --- 3. GESTÃO ADMINISTRATIVA (Apenas Admin) ---
    Route::middleware(['admin'])->group(function () {

        // Utilizadores (Criar, Editar, Apagar, Reset Passwords)
        Route::prefix('dashboard/utilizadores')->name('utilizadores.')->group(function () {
            Route::post('/reset-all', [UserController::class, 'sendPasswordResetAll'])->name('reset-all');
            Route::post('/{id}/reset-password', [UserController::class, 'sendPasswordReset'])->name('reset-password');
            Route::post('/', [UserController::class, 'store'])->name('store');
            Route::put('/{id}', [UserController::class, 'update'])->name('update');
            Route::delete('/{id}', [UserController::class, 'destroy'])->name('destroy');
        });
        // Turmas (Criar, Editar, Apagar, Atribuir)
        Route::prefix('dashboard/turmas')->name('turmas.')->group(function () {
            Route::post('/', [TurmaController::class, 'store'])->name('store');
            Route::put('/{id}', [TurmaController::class, 'update'])->name('update');
            Route::delete('/{id}', [TurmaController::class, 'destroy'])->name('destroy');
            Route::post('/{id}/assign', [TurmaController::class, 'assign'])->name('assign');
        });

        // Disciplinas (Criar, Editar, Apagar) <-- 2. Adiciona este bloco
        Route::prefix('dashboard/disciplinas')->name('disciplinas.')->group(function () {
            Route::post('/', [DisciplinaController::class, 'store'])->name('store');
            Route::put('/{id}', [DisciplinaController::class, 'update'])->name('update');
            Route::delete('/{id}', [DisciplinaController::class, 'destroy'])->name('destroy');
            Route::post('/{id}/assign', [DisciplinaController::class, 'assign'])->name('assign');
        });

        // Categorias (Criar, Editar, Apagar)
        Route::prefix('dashboard/categorias')->name('categorias.')->group(function () {
        Route::post('/', [CategoriaController::class, 'store'])->name('store');
        Route::put('/{id}', [CategoriaController::class, 'update'])->name('update');
        Route::delete('/{id}', [CategoriaController::class, 'destroy'])->name('destroy');
    });

    });

    // --- 4. PERFIL DO UTILIZADOR ---
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// --- 5. AUTHENTICATION ROUTES ---
require __DIR__ . '/auth.php';
