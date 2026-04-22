<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check() && auth()->user()->must_change_password) {
            // Se for um pedido de atualização de password ou logout, permite sempre
            if ($request->routeIs(['password.update', 'logout'])) {
                return $next($request);
            }

            if (!$request->isMethod('GET') && !$request->routeIs('password.update')) {
                return redirect()->back()->withErrors(['error' => 'Tens de alterar a password primeiro.']);
            }
        }

        return $next($request); 
    }
}