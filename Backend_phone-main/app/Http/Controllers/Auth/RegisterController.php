<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user', // Mặc định là user
            'status' => 1,   
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Đăng ký thành công!',
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

        $credentials = $request->only('email', 'password');

        // Thực hiện đăng nhập
        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            // Kiểm tra trạng thái tài khoản
            if ($user->status != 1) {
                Auth::logout();
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tài khoản của bạn đang bị khóa.'
                ], 403);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Chào mừng!',
                'user' => $user,
            ], 200);
        }

        // Nếu sai thông tin
        return response()->json([
            'status' => 'error',
            'message' => 'Email hoặc mật khẩu không chính xác.'
        ], 401);
    }



    // Xem thông tin cá nhân
    public function showProfile()
    {
       $user = User::where('role', 'user')->first(); 

        if (!$user) {
           return response()->json(['message' => 'Chưa có tài khoản nào!'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $user]);
    }



    // Cập nhật thông tin
    public function updateProfile(Request $request)
    {
       // Tìm đúng tài khoản có role là 'user' để update
        $user = User::where('role', 'user')->first();

        if (!$user) {
           return response()->json([
               'status' => 'error', 
               'message' => 'Không tìm thấy tài khoản nào!'
            ], 404);
        }

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