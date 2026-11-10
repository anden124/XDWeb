<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post; // Nhớ import Model Post vào đây

class PostController extends Controller
{
    public function getLatestNews()
    {
        // 1. Lấy 1 tin hot nhất làm tin lớn (is_hot = 1)
        $bigNews = Post::where('is_hot', 1)->latest()->first();
        
        // 2. Lấy 4 tin mới nhất khác (không trùng với tin lớn) làm tin nhỏ
        $smallNews = Post::where('id', '!=', $bigNews->id ?? 0)
                         ->latest()
                         ->take(4)
                         ->get();

        // 3. Trả về JSON để React fetch
        return response()->json([
            'bigNews' => $bigNews,
            'smallNews' => $smallNews
        ]);
    }
}