<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    // Khai báo tên bảng (nếu Sơn đặt tên bảng là posts thì không cần dòng này, nhưng ghi vào cho chắc)
    protected $table = 'posts';

    // Cho phép các trường này được đổ dữ liệu vào (Mass Assignment)
    protected $fillable = [
        'title',
        'slug',
        'summary',
        'content',
        'image',
        'author',
        'is_hot',
        'views'
    ];
}