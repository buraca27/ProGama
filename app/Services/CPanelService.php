<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CPanelService
{
    private $domain;
    private $user;
    private $pass;

    public function __construct()
    {
        $this->domain = trim(env('CPANEL_DOMAIN'));
        $this->user = env('CPANEL_USER');
        $this->pass = env('CPANEL_PASS');
    }

    /**
     * Cria uma nova conta de email no cPanel
     */
    public function createEmail($email, $password)
    {
        return $this->executeCpanelApi($email, 'add_pop', [
            'password' => $password,
            'quota' => 500, // Quota de 500MB, ajusta conforme necessário
        ]);
    }

    /**
     * Altera a password de um email existente
     */
    public function changePassword($email, $newPassword)
    {
        return $this->executeCpanelApi($email, 'passwd_pop', [
            'password' => $newPassword,
        ]);
    }

    /**
     * Apaga uma conta de email
     */
    public function deleteEmail($email)
    {
        return $this->executeCpanelApi($email, 'delete_pop');
    }

    /**
     * Função privada que lida com a requisição HTTP genérica
     */
    private function executeCpanelApi($email, $function, $extraParams = [])
    {
        $emailUser = explode('@', $email)[0];
        
        Log::info("A tentar {$function} no cPanel para: " . $email);

        $params = array_merge([
            'email'  => $emailUser,
            'domain' => $this->domain,
        ], $extraParams);

        try {
            $response = Http::withoutVerifying()
                ->withBasicAuth($this->user, $this->pass)
                ->get("https://{$this->domain}:2083/execute/Email/{$function}", $params);

            if ($response->successful()) {
                Log::info("Sucesso cPanel ({$function}) para: " . $email);
                return true;
            } else {
                Log::error("Falha no Host ({$function}): " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Erro crítico no Host ({$function}): " . $e->getMessage());
            return false;
        }
    }
}