<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TurmaController;
use App\Http\Controllers\DisciplinaController;
use Illuminate\Foundation\Application;
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

// --- 2. ÁREA AUTENTICADA ---
Route::middleware(['auth', 'verified', 'force_password_change'])->group(function () {
    // Dashboard Principal
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

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

    });

    // --- 4. PERFIL DO UTILIZADOR ---
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// --- 5. AUTHENTICATION ROUTES ---
require __DIR__ . '/auth.php';
