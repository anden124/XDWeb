<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\VerifyCustomerEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator; // Thêm dòng này để không lỗi 500

class RegisterController extends Controller
{

    // Đăng ký
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|max:72|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $requiresVerification = config('app.customer_email_enabled');
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user', // Mặc định là user
            'email_verification_required' => $requiresVerification,
            'status' => 1,   
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        $sent = $requiresVerification && rescue(function () use ($user): bool {
            $user->notify(new VerifyCustomerEmail);
            return true;
        }, false);

        return response()->json([
            'status' => 'success',
            'message' => !$requiresVerification ? 'Đã tạo tài khoản. Bạn có thể đăng nhập.'
                : ($sent ? 'Đã tạo tài khoản. Hãy kiểm tra email để xác nhận trước khi đăng nhập.'
                    : 'Đã tạo tài khoản nhưng chưa gửi được email. Hãy dùng nút Gửi lại email xác nhận.'),
            'user' => $user
        ], 201);
    }


    // Đăng nhập
    public function login(Request $request)
    {
        // Kiểm tra định dạng đầu vào
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        // Thực hiện đăng nhập
        if ($user && Hash::check($request->password, $user->password)) {
            abort_unless($user->role === 'user', 403, 'Vui lòng đăng nhập tại trang quản trị.');
            abort_if($user->needsEmailVerification(), 403, 'Bạn cần xác nhận email trước khi đăng nhập.');

            // Kiểm tra trạng thái tài khoản
            if ($user->status != 1) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tài khoản của bạn đang bị khóa.'
                ], 403);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Chào mừng!',
                'user' => $user,
                'access_token' => $user->createToken('customer-token')->plainTextToken,
            ], 200);
        }

        // Nếu sai thông tin
        return response()->json([
            'status' => 'error',
            'message' => 'Email hoặc mật khẩu không chính xác.'
        ], 401);
    }



    // Xem thông tin cá nhân
    public function showProfile(Request $request)
    {
        return response()->json(['status' => 'success', 'data' => $request->user()]);
    }



    // Cập nhật thông tin
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Kiểm tra dữ liệu gửi lên
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
          return response()->json(['errors' => $validator->errors()], 422);
        }

       // Cập nhật vào database phone_store
       $user->update([
          'name' => $request->name,
          'phone' => $request->phone,
          'address' => $request->address,
        ]);

       return response()->json([
          'status' => 'success',
          'message' => 'Cập nhật thành công!',
          'user_moi' => $user
        ], 200);
    }
}
