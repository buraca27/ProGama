<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    // Apenas Admin pode ver a lista completa
    public function viewList(User $user): bool
    {
        
        return $user->id_role == 1;
    }

    //Alunos e Professores(conseguem ver das turmas que fazem parte) podem ver os utilizadores da sua turma
    public function viewTurmaUsers(User $user): bool
    {
        
        return in_array($user->id_role, [2, 3]);
    }

    //Apenas admin pode criar novos utilizadores
    public function create(User $user): bool
    {
       
        return $user->id_role == 1;
    }
    // Apenas Admin pode atualizar/eliminar  outros users (não pode atualizar/eliminar a si próprio através desta policy)
    public function update(User $user, User $model): bool
    {
        
        return $user->id_role == 1 && $user->id !== $model->id;
    }

    
    public function delete(User $user, User $model): bool
    {
        
        if ($user->id_role !== 1) {
            return false;
        }

       
        if ($user->id !== $model->id) {
            return true;
        }

        // Se está a tentar eliminar-se a si próprio:
        // Só permitir se houver pelo menos outro admin no sistema
        $totalAdmins = User::where('id_role', 1)->count();

        if ($totalAdmins <= 1) {
            
            \Log::critical("Admin {$user->id} ({$user->name}) tentou apagar-se a si próprio sendo o ÚNICO admin no sistema");
            return false;
        }

        return true;
    }

    
     // Determina se o utilizador pode ver estatísticas(apenas o admin consegue ver)
     
    public function viewStats(User $user): bool
    {
        
        return $user->id_role == 1;
    }
}
