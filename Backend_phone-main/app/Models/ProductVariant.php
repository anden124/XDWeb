<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $fillable = ['color', 'price', 'sale_price', 'quantity', 'image'];

    public function effectivePrice(): float
    {
        return (float) ($this->sale_price ?? $this->price);
    }
}
