<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class ProductImageController extends Controller
{
    public function show(string $id)
    {
        $image = DB::table('product_images')->where('id', $id)->first();
        abort_unless($image, 404);

        return response(base64_decode($image->content))->withHeaders([
            'Content-Type' => $image->mime_type,
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
