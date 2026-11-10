<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
{
    $query = Product::with('category');

    if ($request->filled('keyword')) {
        $keyword = $request->keyword;
        $query->where(function ($q) use ($keyword) {
            $q->where('name', 'like', '%' . $keyword . '%')
              ->orWhere('sku', 'like', '%' . $keyword . '%')
              ->orWhere('brand', 'like', '%' . $keyword . '%')
              ->orWhere('model', 'like', '%' . $keyword . '%');
        });
    }

    if ($request->filled('category_id')) {
        $query->where('category_id', $request->category_id);
    }

    if ($request->filled('status')) {
        $query->where('status', $request->status);
    }

    if ($request->filled('min_price')) {
        $query->where('price', '>=', $request->min_price);
    }

    if ($request->filled('max_price')) {
        $query->where('price', '<=', $request->max_price);
    }

    $products = $query->latest()->paginate(10);

    return response()->json([
        'success' => true,
        'message' => 'Lấy danh sách sản phẩm thành công',
        'data' => $products
    ]);
}

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255|unique:products,name',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->all();
        $data['slug'] = \Illuminate\Support\Str::slug($request->name);

        // --- FIX LƯU ẢNH TRỰC TIẾP VÀO PUBLIC ---
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            // Tạo tên file duy nhất để không bị trùng
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Di chuyển file thẳng vào thư mục backend/public/products
            $file->move(public_path('products'), $fileName);
            
            // Lưu đường dẫn vào database là "products/tên_file"
            $data['image'] = 'products/' . $fileName;
        }

        $product = Product::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Thêm sản phẩm thành công',
            'data' => $product
        ], 201);
    }

    public function show(string $id)
    {
        $product = Product::with('category')->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Chi tiết sản phẩm',
            'data' => $product
        ]);
    }

    public function update(Request $request, string $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy sản phẩm'], 404);
        }

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255|unique:products,name,' . $id,
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->all();
        $data['slug'] = \Illuminate\Support\Str::slug($request->name);

        // --- FIX CẬP NHẬT ẢNH TRỰC TIẾP VÀO PUBLIC ---
        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu tồn tại trong public/products
            if ($product->image) {
                $oldPath = public_path($product->image);
                if (file_exists($oldPath)) {
                    @unlink($oldPath); // Dùng @ để bỏ qua lỗi nếu file không tồn tại thực tế
                }
            }

            // Lưu ảnh mới
            $file = $request->file('image');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('products'), $fileName);
            
            $data['image'] = 'products/' . $fileName;
        } else {
            // Nếu không chọn file mới, giữ nguyên giá trị cũ
            $data['image'] = $product->image;
        }

        $product->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => $product
        ]);
    }

    public function destroy(string $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm'
            ], 404);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa sản phẩm thành công'
        ]);
    }
}
