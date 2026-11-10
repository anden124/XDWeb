<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'price',
        'sale_price',
        'quantity',
        'image',
        'short_description',
        'description',
        'brand',
        'model',
        'color',
        'storage',
        'ram',
        'is_featured',
        'status',
    ];

    // Quan hệ: sản phẩm thuộc 1 danh mục
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
