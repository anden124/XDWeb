<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $keyword = $request->validate(['keyword' => 'nullable|string|max:255'])['keyword'] ?? null;
        $brands = Brand::select('brands.*')->addSelect([
            'product_count' => Product::selectRaw('COUNT(*)')->whereRaw('LOWER(TRIM(products.brand)) = brands.name_key'),
        ]);
        if ($keyword) {
            $brands->where('name_key', 'like', '%'.mb_strtolower($keyword).'%');
        }

        return response()->json(['data' => $brands->orderBy('name')->orderBy('id')->paginate(10)]);
    }

    public function options()
    {
        return response()->json(['data' => Brand::orderBy('name')->get(['id', 'name'])]);
    }

    public function store(Request $request)
    {
        $data = $this->brandData($request);
        try {
            $brand = Brand::create($data);
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['name' => 'Tên hãng này đã tồn tại.']);
        }

        return response()->json(['data' => $brand], 201);
    }

    public function update(Request $request, Brand $brand)
    {
        $data = $this->brandData($request);
        try {
            $brand = DB::transaction(function () use ($brand, $data) {
                $locked = Brand::lockForUpdate()->findOrFail($brand->id);
                $oldKey = $locked->name_key;
                $locked->update($data);
                Product::whereRaw('LOWER(TRIM(brand)) = ?', [$oldKey])->update(['brand' => $locked->name]);

                return $locked;
            }, 3);
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['name' => 'Tên hãng này đã tồn tại.']);
        }

        return response()->json(['data' => $brand]);
    }

    public function destroy(Brand $brand)
    {
        return DB::transaction(function () use ($brand) {
            $locked = Brand::lockForUpdate()->findOrFail($brand->id);
            abort_if(
                Product::whereRaw('LOWER(TRIM(brand)) = ?', [$locked->name_key])->exists(),
                409,
                'Hãng đang có sản phẩm. Hãy chuyển các sản phẩm sang hãng khác trước.'
            );
            $locked->delete();

            return response()->noContent();
        }, 3);
    }

    private function brandData(Request $request): array
    {
        $name = trim($request->validate(['name' => 'required|string|max:255'])['name']);

        return ['name' => $name, 'name_key' => mb_strtolower($name)];
    }
}
