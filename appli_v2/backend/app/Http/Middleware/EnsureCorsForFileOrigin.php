<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Pages ouvertes en file:// envoient souvent Origin: «null».
 * Access-Control-Allow-Origin: * ne suffit pas toujours ; on renvoie explicitement «null».
 */
class EnsureCorsForFileOrigin
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->is('api/*') && $request->getMethod() === 'OPTIONS') {
            return response('', 204)->withHeaders($this->headers($request));
        }

        $response = $next($request);

        if (!$request->is('api/*')) {
            return $response;
        }

        foreach ($this->headers($request) as $name => $value) {
            $response->headers->set($name, $value);
        }

        return $response;
    }

    private function headers(Request $request): array
    {
        $origin = $request->headers->get('Origin');
        $allowOrigin = '*';
        if ($origin === 'null' || $origin === '') {
            $allowOrigin = 'null';
        } elseif ($origin !== null && $origin !== '') {
            $allowOrigin = $origin;
        }

        return [
            'Access-Control-Allow-Origin' => $allowOrigin,
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Accept, Authorization, X-Requested-With',
        ];
    }
}
