<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        abort_unless($user->role === 'user' && (int) $user->status === 1, 403, 'Chỉ tài khoản khách hàng đang hoạt động mới có thể sử dụng chức năng này.');

        return $next($request);
    }
}
