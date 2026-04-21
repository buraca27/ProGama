<?php

namespace App\Http\Controllers;

use App\Models\Turma;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

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
                    'update' => $request->user()->can('update', $u),
                    'delete' => $request->user()->can('delete', $u),
                ],
            ];
        });

        $estatisticas = [
            'total_users' => DB::table('users')->count(),
            'total_turmas' => $this->tryCatchCount('turmas'),
            'total_desafios' => $this->tryCatchCount('desafios'),
        ];

        $roleMap = [1 => 'admin', 2 => 'professor', 3 => 'aluno'];
        $cargoReal = $roleMap[$user->id_role] ?? 'aluno';

        $turmas = match ($user->id_role) {
            1 => Turma::with(['professores', 'alunos'])->get(),
            2 => User::find($user->id)->turmasLecionadas()->with(['alunos', 'professores'])->get(),
            3 => $user->id_turma ? Turma::where('id', $user->id_turma)->with(['professores', 'alunos'])->get() : [],
            default => [],
        };

        return Inertia::render('Dashboard/Dashboard', [
            'userRoleReal' => $cargoReal,
            'estatisticas' => $estatisticas,
            'utilizadores' => $listaUtilizadores,
            'turmas' => $turmas,
        ]);
    }

    private function tryCatchCount($table)
    {
        try {
            return DB::table($table)->count();
        } catch (\Exception $e) {
            return 0;
        }
    }
}
