# POSE Project - Nền Tảng Thương Mại Điện Tử

## Tổng quan
Dự án POSE là một nền tảng thương mại điện tử hiện đại được xây dựng bằng React (Vite) cho frontend và Node.js/Express cho backend, sử dụng MongoDB làm cơ sở dữ liệu. Ứng dụng cung cấp trải nghiệm mua sắm trực tuyến với giao diện người dùng đẹp mắt và dễ sử dụng.

## Tính năng chính

### Frontend (React + Vite + TailwindCSS)
- Giao diện người dùng
  - Trang chủ hiển thị sản phẩm nổi bật
  - Danh sách sản phẩm với phân trang và sắp xếp
  - Trang chi tiết sản phẩm đầy đủ thông tin
  - Giỏ hàng và thanh toán
  - Tìm kiếm và lọc sản phẩm đa tiêu chí
  - Giao diện responsive cho mọi thiết bị

- Xác thực & Bảo mật
  - Đăng nhập/Đăng ký tài khoản
  - Quên mật khẩu
  - Phân quyền người dùng (Admin/User)
  - Bảo vệ route với ProtectedRoute

- Quản lý (Admin)
  - Quản lý sản phẩm (thêm/sửa/xóa)
  - Quản lý danh mục
  - Quản lý đơn hàng
  - Thống kê và báo cáo

### Backend (Node.js + Express + MongoDB)
- Xác thực & Ủy quyền
  - JWT Authentication
  - Phân quyền người dùng (Role-based)
  - Bảo vệ API với middleware

- API Endpoints
  - Sản phẩm: CRUD, tìm kiếm, lọc, phân trang
  - Danh mục: Quản lý danh mục đa cấp
  - Người dùng: Đăng ký, đăng nhập, quản lý profile
  - Đơn hàng: Tạo và quản lý đơn hàng
  - Đánh giá: Xem và đánh giá sản phẩm

- Cơ sở dữ liệu
  - MongoDB với Mongoose ODM
  - Schema được thiết kế tối ưu
  - Indexing cho hiệu suất cao
  - Tích hợp Cloudinary cho lưu trữ hình ảnh

## Cấu trúc dự án

```
POSEproject/
├── client/                      # Frontend React (Vite)
│   ├── public/                  # Tài nguyên tĩnh
│   ├── src/
│   │   ├── assets/             # Hình ảnh, icons, styles
│   │   ├── components/          # Components tái sử dụng
│   │   │   ├── common/         # Components chung (Header, Footer, v.v.)
│   │   │   └── ui/             # UI components
│   │   ├── context/            # React Context
│   │   ├── pages/              # Các trang
│   │   │   ├── admin/         # Trang quản trị
│   │   │   ├── auth/          # Trang xác thực
│   │   │   ├── common/        # Trang chung
│   │   │   └── customer/      # Trang khách hàng
│   │   ├── redux/             # Redux store và slices
│   │   │   └── slices/        # Redux slices (auth, product, category, v.v.)
│   │   ├── services/          # API services
│   │   ├── App.jsx            # Component gốc
│   │   └── main.jsx           # Điểm vào ứng dụng
│   └── package.json
│
├── server/                     # Backend Node.js
│   ├── config/                # Cấu hình
│   │   ├── cloudinary.js     # Cấu hình Cloudinary
│   │   └── db.js            # Cấu hình database
│   │
│   ├── controllers/           # Controllers xử lý logic
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── productController.js
│   │   └── ...
│   │
│   ├── middlewares/           # Middleware
│   │   ├── auth.js          # Xác thực
│   │   ├── error.js         # Xử lý lỗi
│   │   └── upload.js        # Xử lý upload file
│   │
│   ├── models/               # MongoDB models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   └── ...
│   │
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── ...
│   │
│   ├── utils/                # Tiện ích
│   ├── .env                  # Biến môi trường
│   ├── index.js              # Điểm vào server
│   └── package.json
│
└── README.md                 # Tài liệu dự án
```

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm >= 8.0.0 hoặc yarn >= 1.22.0

### Bước 1: Cài đặt môi trường

1. **Clone repository**
```bash
git clone <repository-url>
cd POSEproject
```

2. **Tạo file cấu hình môi trường**
- Tạo file `.env` trong thư mục `server/` với nội dung:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
DATABASE_NAME=your_database_name
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
COOKIE_EXPIRE=30
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Bước 2: Cài đặt và chạy Backend

```bash
# Di chuyển vào thư mục server
cd server

# Cài đặt dependencies
npm install

# Chạy server ở chế độ phát triển
npm run dev
```

### Bước 3: Cài đặt và chạy Frontend

```bash
# Mở terminal mới và di chuyển vào thư mục client
cd client

# Cài đặt dependencies
npm install

# Chạy ứng dụng React
npm run dev
```

## Truy cập ứng dụng

Sau khi khởi động thành công, bạn có thể truy cập:

- **Frontend (React)**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1

## Tài liệu API

API được document chi tiết tại: `http://localhost:3000/api-docs` (khi chạy server)

## API Endpoints

### Xác thực
- `POST /api/v1/auth/register` - Đăng ký tài khoản
- `POST /api/v1/auth/login` - Đăng nhập
- `GET /api/v1/auth/me` - Lấy thông tin người dùng hiện tại
- `POST /api/v1/auth/logout` - Đăng xuất
- `POST /api/v1/auth/forgot-password` - Quên mật khẩu
- `PUT /api/v1/auth/reset-password/:token` - Đặt lại mật khẩu

### Sản phẩm
- `GET /api/v1/products` - Lấy danh sách sản phẩm (phân trang, lọc, sắp xếp)
- `GET /api/v1/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/v1/products` - Tạo sản phẩm mới (Admin)
- `PUT /api/v1/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/v1/products/:id` - Xóa sản phẩm (Admin)
- `GET /api/v1/products/search?keyword=...` - Tìm kiếm sản phẩm

### Danh mục
- `GET /api/v1/categories` - Lấy danh sách danh mục
- `GET /api/v1/categories/:id` - Lấy chi tiết danh mục
- `POST /api/v1/categories` - Tạo danh mục mới (Admin)
- `PUT /api/v1/categories/:id` - Cập nhật danh mục (Admin)
- `DELETE /api/v1/categories/:id` - Xóa danh mục (Admin)

### Giỏ hàng & Đơn hàng
- `GET /api/v1/cart` - Lấy giỏ hàng
- `POST /api/v1/cart` - Thêm vào giỏ hàng
- `PUT /api/v1/cart/:id` - Cập nhật giỏ hàng
- `DELETE /api/v1/cart/:id` - Xóa khỏi giỏ hàng
- `POST /api/v1/orders` - Tạo đơn hàng mới
- `GET /api/v1/orders/me` - Lịch sử đơn hàng của tôi
- `GET /api/v1/orders` - Danh sách đơn hàng (Admin)
- `PUT /api/v1/orders/:id` - Cập nhật trạng thái đơn hàng (Admin)

### Người dùng
- `GET /api/v1/users` - Danh sách người dùng (Admin)
- `GET /api/v1/users/:id` - Lấy thông tin người dùng
- `PUT /api/v1/users/me` - Cập nhật thông tin cá nhân
- `PUT /api/v1/users/me/avatar` - Cập nhật ảnh đại diện
- `PUT /api/v1/users/:id` - Cập nhật người dùng (Admin)
- `DELETE /api/v1/users/:id` - Xóa người dùng (Admin)
- [ ] Caching strategies
- [ ] SEO optimization
- [ ] Performance monitoring
