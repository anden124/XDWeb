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
        'specifications',
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

    public function variants()
    {
        return $this->hasMany(ProductVariant::class)->orderBy('id');
    }
}
