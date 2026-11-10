<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\OrderController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ProductController as UserProductController;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\DB;       
use Illuminate\Support\Facades\Artisan;

// Đăng nhập , đăng ký user
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [RegisterController::class, 'login']);


//
Route::post('orders', [OrderController::class, 'store']);


//Xem profile và update user
Route::get('/profile', [RegisterController::class, 'showProfile']);
Route::post('/profile/update', [RegisterController::class, 'updateProfile']);


//Tìm kiếm và hiển thị chi tiết sản phẩm
Route::get('/products/search', [UserProductController::class, 'search']);
Route::get('/products', [UserProductController::class, 'index']);
Route::get('/products/{id}', [UserProductController::class, 'show']);
Route::get('/news/latest', [PostController::class, 'getLatestNews']);


Route::prefix('admin')->group(function () {
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('logout-all', [AuthController::class, 'logoutAll']);

        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('products', ProductController::class);

        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{id}', [OrderController::class, 'show']);
        Route::put('orders/{id}/status', [OrderController::class, 'updateStatus']);

        Route::get('users', [UserController::class, 'index']);
        Route::get('users/{id}', [UserController::class, 'show']);
        Route::put('users/{id}/role', [UserController::class, 'updateRole']);
        Route::put('users/{id}/status', [UserController::class, 'updateStatus']);
        Route::delete('users/{id}', [UserController::class, 'destroy']);
    });
});
Route::get('/migrate-database', function () {
    try {
        // Thêm dòng này để xóa cache cấu hình mà không cần dùng Shell
        Artisan::call('config:clear'); 
        Artisan::call('cache:clear');

        // Chạy lệnh migrate
        Artisan::call('migrate --force');
        
        return response()->json([
            'status' => 'success',
            'message' => 'Đã xóa cache và tạo bảng thành công!',
            'output' => Artisan::output()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Lỗi: ' . $e->getMessage()
        ], 500);
    }
});