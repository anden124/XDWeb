<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'note' => 'nullable|string',
            'payment_method' => 'nullable|string|in:cod,banking',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|integer',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            $subtotal = 0;

            $orderItemsData = [];

            foreach ($request->items as $item) {
                $product = Product::lockForUpdate()->find($item['product_id']);

                if (!$product) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Sản phẩm không tồn tại'
                    ], 404);
                }

                if ((int) $product->status !== 1) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Sản phẩm ' . $product->name . ' hiện không khả dụng'
                    ], 422);
                }

                $variantId = $item['product_variant_id'] ?? null;
                $variant = $variantId ? $product->variants()->lockForUpdate()->find($variantId) : null;
                if (($variantId && !$variant) || (!$variantId && $product->variants()->exists())) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Vui lòng chọn lại phiên bản màu cho sản phẩm '.$product->name.'.',
                    ], 422);
                }

                $stockItem = $variant ?? $product;
                if ($stockItem->quantity < $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Sản phẩm ' . $product->name . ' không đủ số lượng tồn kho'
                    ], 422);
                }

                $price = $variant?->effectivePrice() ?? ($product->sale_price > 0 ? $product->sale_price : $product->price);

                $itemSubtotal = $price * $item['quantity'];
                $subtotal += $itemSubtotal;

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'variant_color' => $variant?->color,
                    'price' => $price,
                    'quantity' => $item['quantity'],
                    'subtotal' => $itemSubtotal,
                ];

                $stockItem->decrement('quantity', $item['quantity']);
            }

            $shippingFee = $subtotal >= 2000000 ? 0 : 30000;
            $totalAmount = $subtotal + $shippingFee;

            $order = Order::create([
                'user_id' => $request->user()->id,
                'order_code' => 'DH' . now()->format('YmdHis') . strtoupper(Str::random(4)),
                'customer_name' => $request->customer_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'note' => $request->note,
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'discount_amount' => 0,
                'total_amount' => $totalAmount,
                'payment_method' => $request->payment_method ?? 'cod',
                'payment_status' => 'unpaid',
                'status' => 'pending',
            ]);

            foreach ($orderItemsData as $row) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $row['product_id'],
                    'product_variant_id' => $row['product_variant_id'],
                    'product_name' => $row['product_name'],
                    'variant_color' => $row['variant_color'],
                    'price' => $row['price'],
                    'quantity' => $row['quantity'],
                    'subtotal' => $row['subtotal'],
                ]);
            }

            DB::commit();

            $order->load('items');

            return response()->json([
                'success' => true,
                'message' => 'Đặt hàng thành công',
                'data' => $order
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi tạo đơn hàng',
            ], 500);
        }
    }

    public function mine(Request $request)
    {
        $orders = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->orderByDesc('id')
            ->paginate(10);

        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function index(Request $request)
    {
        $filters = $request->validate(['user_id' => 'sometimes|required|integer|min:1']);
        $query = Order::with(['user', 'items'])->latest()->orderByDesc('id');
        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->where(function ($q) use ($keyword) {
                $q->where('order_code', 'like', '%' . $keyword . '%')
                  ->orWhere('customer_name', 'like', '%' . $keyword . '%')
                  ->orWhere('phone', 'like', '%' . $keyword . '%');
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách đơn hàng thành công',
            'data' => $orders
        ]);
    }

    public function show(string $id)
    {
        $order = Order::with(['user', 'items.product'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Chi tiết đơn hàng',
            'data' => $order
        ]);
    }

    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,shipping,completed,cancelled'
        ]);

        return DB::transaction(function () use ($id, $validated) {
            $order = Order::lockForUpdate()->find($id);
            abort_if(!$order, 404, 'Không tìm thấy đơn hàng');

            $status = $validated['status'];
            abort_if($order->status === 'cancelled' && $status !== 'cancelled', 422, 'Đơn đã hủy không thể mở lại.');
            abort_if($order->status === 'completed' && $status !== 'completed', 422, 'Đơn đã hoàn tất không thể đổi trạng thái.');

            if ($status === 'cancelled' && $order->status !== 'cancelled') {
                foreach ($order->items()->orderBy('product_id')->get() as $item) {
                    if ($item->product_variant_id) {
                        ProductVariant::whereKey($item->product_variant_id)->increment('quantity', $item->quantity);
                    } else {
                        Product::whereKey($item->product_id)->increment('quantity', $item->quantity);
                    }
                }
            }

            $order->update(['status' => $status]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái đơn hàng thành công',
                'data' => $order,
            ]);
        }, 3);
    }
}
