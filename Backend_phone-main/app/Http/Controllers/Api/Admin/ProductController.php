<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Brand;
use Closure;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    public function index(Request $request)
{
    $query = Product::with(['category', 'variants']);

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
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255|unique:products,name',
            'color' => 'nullable|string|max:255',
            'ram' => 'nullable|string|max:255',
            'storage' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:5000',
            'specifications' => 'nullable|string|max:5000',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ] + $this->variantRules());

        $data = $request->except('variants');
        $data['slug'] = \Illuminate\Support\Str::slug($request->name);

        // --- FIX LƯU ẢNH TRỰC TIẾP VÀO PUBLIC ---
        $databaseImage = config('app.product_images_in_database') ? $request->file('image') : null;
        if ($request->hasFile('image') && !$databaseImage) {
            $file = $request->file('image');
            // Tạo tên file duy nhất để không bị trùng
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Di chuyển file thẳng vào thư mục backend/public/products
            $file->move(public_path('products'), $fileName);
            
            // Lưu đường dẫn vào database là "products/tên_file"
            $data['image'] = 'products/' . $fileName;
        }

        $product = $this->withVariantUploads($validated['variants'] ?? [], function (array $variants, ?string $image) use ($data) {
            if ($image !== null) {
                $data['image'] = $image;
            }
            $product = Product::create($this->withManagedBrand($data));
            $this->saveVariants($product, $variants);
            return $product->load('variants');
        }, $databaseImage);

        return response()->json([
            'success' => true,
            'message' => 'Thêm sản phẩm thành công',
            'data' => $product
        ], 201);
    }

    public function show(string $id)
    {
        $product = Product::with(['category', 'variants'])->find($id);

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

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255|unique:products,name,' . $id,
            'color' => 'nullable|string|max:255',
            'ram' => 'nullable|string|max:255',
            'storage' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:5000',
            'specifications' => 'nullable|string|max:5000',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ] + $this->variantRules($product));

        $data = $request->except('variants');
        $data['slug'] = \Illuminate\Support\Str::slug($request->name);

        // --- FIX CẬP NHẬT ẢNH TRỰC TIẾP VÀO PUBLIC ---
        $databaseImage = config('app.product_images_in_database') ? $request->file('image') : null;
        if ($request->hasFile('image') && !$databaseImage) {
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

        $product = $this->withVariantUploads($validated['variants'] ?? [], function (array $variants, ?string $image) use ($id, $data) {
            $product = Product::lockForUpdate()->findOrFail($id);
            if ($image !== null) {
                $data['image'] = $image;
            }
            $product->update($this->withManagedBrand($data));
            $this->saveVariants($product, $variants);
            return $product->load('variants');
        }, $databaseImage);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => $product
        ]);
    }

    private function variantRules(?Product $product = null): array
    {
        return [
            'variants' => 'sometimes|array|max:30',
            'variants.*' => 'array:id,color,price,sale_price,quantity,image,image_file',
            'variants.*.id' => $product
                ? ['sometimes', 'integer', 'distinct', Rule::exists('product_variants', 'id')->where('product_id', $product->id)]
                : 'prohibited',
            'variants.*.color' => 'required|string|max:100|distinct:ignore_case',
            'variants.*.price' => 'required|numeric|min:0|max:9999999999.99',
            'variants.*.sale_price' => 'nullable|numeric|gt:0|max:9999999999.99',
            'variants.*.quantity' => 'required|integer|min:0|max:2147483647',
            'variants.*.image' => 'nullable|url:http,https|max:2048',
            'variants.*.image_file' => 'sometimes|image|mimes:jpeg,png,gif,webp|max:2048',
        ];
    }

    private function withVariantUploads(array $variants, Closure $save, ?UploadedFile $mainImage): Product
    {
        if (config('app.product_images_in_database')) {
            return DB::transaction(function () use ($variants, $save, $mainImage) {
                foreach ($variants as &$variant) {
                    if (isset($variant['image_file'])) {
                        $variant['image'] = $this->storeDatabaseImage($variant['image_file']);
                        unset($variant['image_file']);
                    }
                }
                unset($variant);
                return $save($variants, $mainImage ? $this->storeDatabaseImage($mainImage) : null);
            }, 3);
        }

        $uploaded = [];
        try {
            foreach ($variants as $index => $variant) {
                if (!isset($variant['image_file'])) {
                    continue;
                }
                $file = $variant['image_file'];
                $filename = 'variant-'.Str::uuid().'.'.$file->guessExtension();
                $file->move(public_path('products'), $filename);
                $variants[$index]['image'] = 'products/'.$filename;
                unset($variants[$index]['image_file']);
                $uploaded[] = $filename;
            }

            return DB::transaction(fn () => $save($variants, null), 3);
        } catch (\Throwable $error) {
            foreach ($uploaded as $filename) {
                \Illuminate\Support\Facades\File::delete(public_path('products/'.$filename));
            }
            throw $error;
        }
    }

    private function storeDatabaseImage(UploadedFile $image): string
    {
        $id = (string) Str::uuid();
        DB::table('product_images')->insert([
            'id' => $id,
            'mime_type' => $image->getMimeType(),
            'content' => base64_encode($image->getContent()),
        ]);

        return 'api/product-images/'.$id;
    }

    private function withManagedBrand(array $data): array
    {
        if (isset($data['brand']) && $data['brand'] !== '') {
            $brand = Brand::where('name_key', mb_strtolower(trim($data['brand'])))->lockForUpdate()->first();
            if (!$brand) {
                throw ValidationException::withMessages(['brand' => 'Hãy chọn một hãng trong danh sách quản lý hãng.']);
            }
            $data['brand'] = $brand->name;
        }

        return $data;
    }

    private function saveVariants(Product $product, array $variants): void
    {
        foreach ($variants as $variant) {
            $id = $variant['id'] ?? null;
            unset($variant['id']);
            if ($id) {
                $product->variants()->findOrFail($id)->update($variant);
            } else {
                $product->variants()->create($variant);
            }
        }

        $saved = $product->variants()->get();
        if ($saved->map(fn ($variant) => mb_strtolower($variant->color))->unique()->count() !== $saved->count()) {
            throw ValidationException::withMessages(['variants' => 'Mỗi phiên bản phải có một màu riêng.']);
        }
        foreach ($saved as $variant) {
            if ($variant->sale_price !== null && $variant->sale_price >= $variant->price) {
                throw ValidationException::withMessages([
                    'variants' => 'Giá khuyến mãi của màu '.$variant->color.' phải thấp hơn giá gốc.',
                ]);
            }
        }
        $lowest = $saved->sortBy(fn ($variant) => $variant->effectivePrice())->first();
        if ($lowest) {
            $product->update(['price' => $lowest->price, 'sale_price' => $lowest->sale_price]);
        }
    }

    public function adjustStock(Request $request, string $id)
    {
        $validated = $request->validate([
            'operation' => 'required|in:receive,issue',
            'quantity' => 'required|integer|min:1|max:2147483647',
            'product_variant_id' => 'nullable|integer|min:1',
        ]);

        return DB::transaction(function () use ($id, $validated) {
            $product = Product::lockForUpdate()->findOrFail($id);
            $variantId = $validated['product_variant_id'] ?? null;
            $stockItem = $product;
            if ($variantId !== null) {
                $stockItem = $product->variants()->lockForUpdate()->find($variantId);
                abort_unless($stockItem, 422, 'Phiên bản màu không thuộc sản phẩm này.');
            } else {
                abort_if($product->variants()->exists(), 422, 'Vui lòng chọn phiên bản màu để điều chỉnh tồn kho.');
            }

            $amount = (int) $validated['quantity'];
            $quantity = $stockItem->quantity + ($validated['operation'] === 'receive' ? $amount : -$amount);
            abort_if($quantity < 0, 422, 'Số lượng xuất vượt quá tồn kho hiện tại.');
            abort_if($quantity > 2147483647, 422, 'Tồn kho vượt quá giới hạn cho phép.');
            $stockItem->update(['quantity' => $quantity]);

            return response()->json([
                'success' => true,
                'message' => 'Đã cập nhật tồn kho.',
                'data' => ['quantity' => $quantity],
            ]);
        }, 3);
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

        try {
            $product->delete();
        } catch (QueryException $error) {
            if (!in_array((string) $error->getCode(), ['23000', '23503'], true)) {
                throw $error;
            }
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm đã có trong đơn hàng nên không thể xóa.',
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa sản phẩm thành công'
        ]);
    }
}
