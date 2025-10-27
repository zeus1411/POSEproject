# Hướng dẫn chạy nhanh POSE Project

## Bước 1: Cài đặt dependencies

```bash
# Cài đặt server dependencies
cd server
npm install

# Cài đặt client dependencies
cd ../client
npm install
```

## Bước 2: Cấu hình environment

Tạo file `.env` trong thư mục `server`:
```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=pose_project
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

Tạo file `.env` trong thư mục `client`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Bước 3: Seed dữ liệu mẫu

```bash
cd server
npm run seed
```

## Bước 4: Chạy ứng dụng

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

## Truy cập ứng dụng

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000/api/v1

## Tài khoản admin

- **Email**: admin@example.com
- **Password**: admin123

## Tính năng đã triển khai

✅ Trang danh sách sản phẩm với giao diện đẹp
✅ Trang chi tiết sản phẩm
✅ Tìm kiếm và lọc sản phẩm
✅ Redux store và tích hợp API
✅ Pagination
✅ Responsive design
✅ Component tái sử dụng

## Cấu trúc API

### Sản phẩm
- `GET /api/v1/products` - Danh sách sản phẩm
- `GET /api/v1/products/search` - Tìm kiếm với filters
- `GET /api/v1/products/:id` - Chi tiết sản phẩm

### Danh mục
- `GET /api/v1/categories` - Danh sách danh mục
- `GET /api/v1/categories/tree` - Cây danh mục
- `GET /api/v1/categories/root` - Danh mục gốc

## Troubleshooting

### Lỗi kết nối MongoDB
- Đảm bảo MongoDB đang chạy
- Kiểm tra MONGODB_URI trong .env

### Lỗi CORS
- Kiểm tra origin trong server/index.js
- Đảm bảo client chạy trên port 5173

### Lỗi API
- Kiểm tra VITE_API_URL trong client/.env
- Đảm bảo server đang chạy trên port 5000
