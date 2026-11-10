<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{

    /*Hàm index(): Lấy danh sách tất cả điện thoại đang bán */
    public function index()
    {
        // Chỉ lấy sản phẩm có status = 1 (đang hoạt động)
        $products = Product::where('status', 1)
            ->select('id', 'name', 'price', 'sale_price', 'image', 'brand', 'ram', 'storage')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Lấy danh sách sản phẩm thành công',
            'count' => $products->count(),
            'data' => $products
        ], 200);
    }


    
    /* Hàm show($id): Xem chi tiết một cái điện thoại cụ thể
    * Dùng khi User click vào một sản phẩm để xem thông số kỹ thuật
    */
    public function show($id)
    {
        // Tìm sản phẩm theo ID
        $product = Product::find($id);

        // Nếu không tìm thấy sản phẩm
        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rất tiếc, sản phẩm này không tồn tại hoặc đã ngừng kinh doanh!'
            ], 404);
        }

        // Trả về toàn bộ thông tin chi tiết (cấu hình, mô tả...)
        return response()->json([
            'status' => 'success',
            'message' => 'Lấy chi tiết sản phẩm thành công',
            'data' => $product
        ], 200);
    }

    // Search
    public function search(Request $request)
    {
    //lấy sản phẩm đang kinh doanh
    $query = Product::where('status', 1);

    $keyword = trim($request->query('keyword', ''));
    $maxPrice = $request->query('max_price');
    $ram = $request->query('ram');
    $hz = $request->query('hz');
    $os = $request->query('os');
    $feature = $request->query('feature');

    // Xử lý TỪ KHÓA (Tên/Hãng)
    if ($keyword !== '') {
        $cleanKeyword = str_replace(' ', '', $keyword);
        $query->where(function($q) use ($keyword, $cleanKeyword) {
            $q->where('name', 'LIKE', "%{$keyword}%")
              ->orWhere('brand', 'LIKE', "%{$keyword}%")
              ->orWhereRaw("REPLACE(name, ' ', '') LIKE ?", ["%{$cleanKeyword}%"]);
        });
    }

    // Lọc theo GIÁ cả giá gốc và giá khuyến mãi)
    if (!empty($maxPrice)) {
        $query->where(function($q) use ($maxPrice) {
            $q->where(function($q1) use ($maxPrice) {
                // Nếu có giá khuyến mãi, thì sale_price phải <= maxPrice
                $q1->where('sale_price', '>', 0)
                   ->where('sale_price', '<=', $maxPrice);
            })->orWhere(function($q2) use ($maxPrice) {
                // Nếu không có giá khuyến mãi, thì price phải <= maxPrice
                $q2->where('sale_price', 0)
                   ->where('price', '<=', $maxPrice);
            });
        });
    }

    // Lọc theo RAM
    if (!empty($ram)) {
        // Ví dụ: Tìm "8GB" trong cột ram
        $query->where('ram', 'LIKE', "%{$ram}%");
    }

    // Lọc HỆ ĐIỀU HÀNH (Tìm trong cột 'description')
    if (!empty($os)) {
        $query->where('description', 'LIKE', "%{$os}%");
    }

    // Lọc Hz (Tìm "120Hz" hoặc "120 Hz" trong description)
    if (!empty($hz)) {
        $query->where(function($q) use ($hz) {
            $q->where('description', 'LIKE', "%{$hz}Hz%")
              ->orWhere('description', 'LIKE', "%{$hz} Hz%");
        });
    }

    // Lọc TÍNH NĂNG ĐẶC BIỆT (Dựa trên mô tả trong database)
    if (!empty($feature)) {
        $featureMap = [
            'wireless' => 'sạc không dây',
            'fast'     => 'sạc siêu nhanh', // hoặc 'sạc nhanh' tùy nhập liệu
            'reverse'  => 'sạc ngược cho thiết bị khác',
            'oled'     => 'OLED'
        ];
        
        if (isset($featureMap[$feature])) {
            $query->where('description', 'LIKE', "%{$featureMap[$feature]}%");
        }
    }

    // Lấy kết quả cuối cùng và trả về JSON
    $products = $query->get();

    return response()->json([
        'status' => 'success',
        'count'  => $products->count(),
        'data'   => $products
    ]);
    }
}