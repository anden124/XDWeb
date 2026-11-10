<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');

            // Phân quyền
            $table->string('role')->default('user'); // admin / user

            // Thông tin thêm
            $table->string('phone')->nullable();
            $table->string('address')->nullable();

            // Trạng thái
            $table->boolean('status')->default(1); // 1: active, 0: khóa

            // Laravel mặc định
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
