<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\VerifyCustomerEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;

class CustomerEmailController extends Controller
{
    public function verify(User $user, string $hash)
    {
        abort_unless($user->role === 'user' && hash_equals(sha1($user->email), $hash), 403);

        if (!$user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        return redirect()->away($this->frontendLink('/login?verified=1'));
    }

    public function resend(Request $request)
    {
        abort_unless(config('app.customer_email_enabled'), 503, 'Bản demo chưa hỗ trợ gửi email.');
        $validated = $request->validate(['email' => 'required|email|max:255']);
        $user = User::where('email', $validated['email'])->where('role', 'user')
            ->where('email_verification_required', true)->whereNull('email_verified_at')->first();

        if ($user && $user->status) {
            rescue(fn () => $user->notify(new VerifyCustomerEmail));
        }

        return response()->json(['message' => 'Nếu tài khoản cần xác nhận, bạn sẽ nhận được email hướng dẫn.']);
    }

    public function forgot(Request $request)
    {
        abort_unless(config('app.customer_email_enabled'), 503, 'Bản demo chưa hỗ trợ gửi email.');
        $validated = $request->validate(['email' => 'required|email|max:255']);
        $user = User::where('email', $validated['email'])->where('role', 'user')->first();

        if ($user && $user->status && !$user->needsEmailVerification()) {
            rescue(fn () => Password::sendResetLink($validated + ['role' => 'user', 'status' => true],
                function (User $recipient, string $token): void {
                    $link = $this->frontendLink('/dat-lai-mat-khau?'.http_build_query([
                        'email' => $recipient->email,
                        'token' => $token,
                    ]));
                    Mail::raw("Bạn đã yêu cầu đặt lại mật khẩu PhoneStore.\n\n$link\n\nLiên kết có hiệu lực trong 60 phút.", function ($message) use ($recipient) {
                        $message->to($recipient->email)->subject('Đặt lại mật khẩu PhoneStore');
                    });
                }
            ));
        }

        return response()->json(['message' => 'Nếu email đủ điều kiện, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.']);
    }

    public function reset(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:8|max:72|confirmed',
        ]);

        $status = Password::reset($validated + ['role' => 'user', 'status' => true], function (User $user, string $password): void {
            DB::transaction(function () use ($user, $password): void {
                $user->forceFill(['password' => Hash::make($password), 'remember_token' => null])->save();
                $user->tokens()->delete();
            });
        });

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'], 422);
        }

        return response()->json(['message' => 'Đã đổi mật khẩu. Bạn có thể đăng nhập lại.']);
    }

    private function frontendLink(string $path): string
    {
        $base = rtrim(config('app.frontend_url'), '/');

        return $base.(config('app.frontend_hash_routing') ? '/#' : '').$path;
    }
}
