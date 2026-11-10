# Tài liệu dự án XDWeb

## 1. Giới thiệu tổng quan
Dự án gồm 2 phần chính:
- `Backend_phone-main`: backend Laravel cung cấp API cho website bán điện thoại.
- `WebsiteBanDienThoai-main`: frontend React + Vite dùng để hiển thị giao diện người dùng.

Backend và frontend hoạt động tách biệt, frontend gọi API backend để lấy dữ liệu sản phẩm, tin tức, đơn hàng, đăng nhập và thanh toán.

## 2. Cấu trúc chính

### 2.1 Backend (`Backend_phone-main`)
- `app/Http/Controllers`: chứa controller xử lý API.
  - `Auth\RegisterController.php`: đăng ký, đăng nhập, xem và cập nhật profile người dùng.
  - `Api/Admin/AuthController.php`: đăng nhập admin, xem thông tin admin, logout, logout-all.
  - `Api/Admin/UserController.php`: quản lý người dùng (danh sách, chi tiết, cập nhật role/status, xóa).
  - `Api/Admin/ProductController.php`: CRUD sản phẩm.
  - `Api/Admin/CategoryController.php`: CRUD danh mục.
  - `Api/Admin/OrderController.php`: quản lý đơn hàng, xem danh sách, chi tiết, cập nhật trạng thái; đồng thời cho phép thêm đơn hàng từ client.
  - `ProductController.php`: API public lấy danh sách sản phẩm, xem chi tiết và tìm kiếm.
  - `PostController.php`: API lấy tin tức mới nhất.
- `routes/api.php`: định nghĩa tất cả endpoint API.
- `database/migrations`: định nghĩa cấu trúc bảng.
- `app/Models`: chứa các model `User`, `Product`, `Category`, `Order`, `OrderItem`, `Post`.

### 2.2 Frontend (`WebsiteBanDienThoai-main`)
- `src/App.jsx`: cấu hình router và phần header chính.
- `src/pages`: chứa các trang như `Home`, `Auth`, `ProductDetail`, `Shop`, `DealHot`, `Cart`, `Checkout`, v.v.
- `src/context/CartContext`: quản lý giỏ hàng.
- `src/components`: chứa các component nhỏ dùng lại.
- `package.json`: React + Vite + Axios + Bootstrap.

## 3. Các điểm chính của backend

### 3.1 Xác thực và phân quyền
- Người dùng thường: `/register`, `/login`.
- Admin: `/admin/login` và dùng middleware `auth:sanctum` + `admin`.
- Admin tạo token bằng `createToken('admin-token')`.

### 3.2 API người dùng public
- `POST /register`: đăng ký tài khoản user.
- `POST /login`: đăng nhập user.
- `GET /profile`: lấy profile user hiện tại (hiện đang lấy user đầu tiên có role `user`).
- `POST /profile/update`: cập nhật thông tin user (cũng thao tác trên user đầu tiên `role=user`).
- `GET /products`: lấy toàn bộ sản phẩm đang hoạt động.
- `GET /products/{id}`: lấy chi tiết sản phẩm.
- `GET /products/search`: tìm kiếm sản phẩm theo keyword, max_price, ram, os, hz, feature.
- `GET /news/latest`: lấy tin tức mới nhất (1 tin lớn + 4 tin nhỏ).
- `POST /orders`: tạo đơn hàng mới.

### 3.3 API admin
- `POST /admin/login`: đăng nhập admin.
- `GET /admin/me`: lấy thông tin admin hiện tại.
- `POST /admin/logout`: đăng xuất token hiện tại.
- `POST /admin/logout-all`: đăng xuất tất cả token admin.
- `apiResource /admin/categories`: CRUD danh mục.
- `apiResource /admin/products`: CRUD sản phẩm.
- `GET /admin/orders`: danh sách đơn hàng.
- `GET /admin/orders/{id}`: chi tiết đơn hàng.
- `PUT /admin/orders/{id}/status`: cập nhật trạng thái đơn hàng.
- `GET /admin/users`: danh sách user.
- `GET /admin/users/{id}`: chi tiết user.
- `PUT /admin/users/{id}/role`: cập nhật role user.
- `PUT /admin/users/{id}/status`: cập nhật trạng thái user.
- `DELETE /admin/users/{id}`: xóa user (không xóa admin).

### 3.4 Endpoint hỗ trợ dev
- `GET /migrate-database`: xóa cache config và chạy migrate trực tiếp.

## 4. Mô hình dữ liệu chính

### 4.1 users
- `id`, `name`, `email`, `password`
- `role`: `user` hoặc `admin`
- `status`: `1` active, `0` khóa.
- `phone`, `address`

### 4.2 categories
- `id`, `name`, `slug`, `description`, `image`, `status`

### 4.3 products
- `id`, `category_id`, `name`, `slug`, `sku`
- `price`, `sale_price`, `quantity`
- `image`, `short_description`, `description`
- `brand`, `model`, `color`, `storage`, `ram`
- `is_featured`, `status`

### 4.4 orders
- `id`, `user_id`, `order_code`, `customer_name`, `email`, `phone`, `address`, `note`
- `subtotal`, `shipping_fee`, `discount_amount`, `total_amount`
- `payment_method`, `payment_status`
- `status`: `pending`, `confirmed`, `shipping`, `completed`, `cancelled`

### 4.5 order_items
- `order_id`, `product_id`, `product_name`, `price`, `quantity`, `subtotal`

### 4.6 posts
- `title`, `slug`, `summary`, `content`, `image`, `author`, `is_hot`, `views`

## 5. Hướng dẫn chạy dự án

### 5.1 Backend
1. Vào thư mục `Backend_phone-main`
2. Chạy `composer install`
3. Tạo file `.env` từ `.env.example`
4. Chạy `php artisan key:generate`
5. Chạy `php artisan migrate`
6. Chạy `php artisan serve`

### 5.2 Frontend
1. Vào thư mục `WebsiteBanDienThoai-main`
2. Chạy `npm install`
3. Chạy `npm run dev`

## 6. Ghi chú quan trọng
- `ProductController` public chỉ lọc `status = 1`.
- `ProductController` admin lưu hình ảnh trực tiếp vào `public/products`.
- API profile hiện chưa sử dụng người dùng đang đăng nhập thực sự, mà lấy user đầu tiên `role=user`.
- Admin route sử dụng `auth:sanctum` nên cần cấu hình Sanctum nếu chạy trên môi trường dev.

## 7. Gợi ý cải thiện
- Cập nhật API profile để dùng `auth()->user()` thay vì `User::where('role', 'user')->first()`.
- Thêm API đăng xuất user public (nếu dùng token).
- Hoàn thiện phần `posts` nếu thiếu migration bảng `posts`.
- Thêm unit test cho các API chính.
