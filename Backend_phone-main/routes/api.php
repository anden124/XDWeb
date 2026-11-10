<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\OrderController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\BrandController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\CustomerEmailController;
use App\Http\Controllers\ProductController as UserProductController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProductImageController;
use App\Http\Middleware\CustomerMiddleware;

// Đăng nhập , đăng ký user
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [RegisterController::class, 'login']);
Route::get('/email/verify/{user}/{hash}', [CustomerEmailController::class, 'verify'])
    ->middleware('signed:relative')->name('customer.verify');
Route::middleware('throttle:6,1')->group(function () {
    Route::post('/email/resend', [CustomerEmailController::class, 'resend']);
    Route::post('/forgot-password', [CustomerEmailController::class, 'forgot']);
    Route::post('/reset-password', [CustomerEmailController::class, 'reset']);
});


//
Route::middleware(['auth:sanctum', CustomerMiddleware::class])->group(function () {
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'mine']);
    Route::get('/profile', [RegisterController::class, 'showProfile']);
    Route::post('/profile/update', [RegisterController::class, 'updateProfile']);
});


//Tìm kiếm và hiển thị chi tiết sản phẩm
Route::get('/products/search', [UserProductController::class, 'search']);
Route::get('/products', [UserProductController::class, 'index']);
Route::get('/products/{id}', [UserProductController::class, 'show']);
Route::get('/product-images/{id}', [ProductImageController::class, 'show'])->whereUuid('id');
Route::get('/news/latest', [PostController::class, 'getLatestNews']);


Route::prefix('admin')->group(function () {
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('logout-all', [AuthController::class, 'logoutAll']);

        Route::apiResource('categories', CategoryController::class);
        Route::get('brands/options', [BrandController::class, 'options']);
        Route::apiResource('brands', BrandController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::apiResource('products', ProductController::class);
        Route::patch('products/{id}/stock', [ProductController::class, 'adjustStock']);

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
