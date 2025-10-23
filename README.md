# Dự Án POSE - Nền Tảng Thương Mại Điện Tử

## Mục Lục
- [Tổng Quan Dự Án](#tổng-quan-dự-án)
- [Tính Năng](#tính-năng)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt Và Chạy Ứng Dụng](#cài-đặt-và-chạy-ứng-dụng)
- [Biến Môi Trường](#biến-môi-trường)
- [Tài Liệu API](#tài-liệu-api)
- [Cấu Trúc Frontend](#cấu-trúc-frontend)
- [Cấu Trúc Backend](#cấu-trúc-backend)
- [Luồng Xác Thực](#luồng-xác-thực)
- [Triển Khai](#triển-khai)
- [Đóng Góp](#đóng-góp)
- [Giấy Phép](#giấy-phép)

## Tổng Quan Dự Án
POSE là một nền tảng thương mại điện tử full-stack được xây dựng bằng MERN stack (MongoDB, Express.js, React, Node.js) cho phép người dùng duyệt sản phẩm, mua hàng và quản lý đơn đặt hàng. Nền tảng bao gồm cả giao diện dành cho người dùng và quản trị viên.

## Tính Năng

### Dành Cho Người Dùng
- Đăng ký và đăng nhập tài khoản
- Duyệt sản phẩm với tìm kiếm và bộ lọc
- Thêm sản phẩm vào giỏ hàng
- Đặt hàng và theo dõi đơn hàng
- Xem lịch sử đơn hàng
- Quản lý thông tin cá nhân

### Dành Cho Quản Trị Viên
- Quản lý sản phẩm (thêm, sửa, xóa, xem)
- Quản lý đơn hàng
- Báo cáo và thống kê doanh thu
- Quản lý khuyến mãi và giảm giá
- Quản lý người dùng

## Công Nghệ Sử Dụng

### Frontend
- React.js
- React Router để điều hướng
- TailwindCSS cho giao diện
- Redux để quản lý trạng thái
- Axios để gọi API
- React Icons

### Backend
- Node.js với Express.js
- MongoDB với Mongoose ODM
- JWT để xác thực
- Bcrypt để mã hóa mật khẩu
- Cloudinary để lưu trữ hình ảnh
- Nodemailer để gửi email thông báo

## Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt:
- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn
- MongoDB (cục bộ hoặc MongoDB Atlas)
- Git

## Cài Đặt Và Chạy Ứng Dụng

### 1. Sao chép kho lưu trữ
```bash
git clone [your-repository-url]
cd POSE-project
```

### 2. Cài đặt Backend
```bash
cd server
npm install
```

### 3. Cài đặt Frontend
```bash
cd ../client
npm install
```

### 4. Khởi động máy chủ phát triển

Trong thư mục server:
```bash
npm run dev
```

Trong thư mục client:
```bash
npm run dev
```

Ứng dụng sẽ khả dụng tại `http://localhost:5173`

## Biến Môi Trường

### Server (tệp `.env` trong thư mục server)
```
PORT=3000
DATABASE_NAME='AquaticStorePOSE'
MONGODB_URI='your_mongodb_connection_string'
JWT_SECRET=your_jwt_secret_key
JWT_LIFETIME=1d
```

### Client (tệp `.env` trong thư mục client)
```
VITE_API_URL=http://localhost:3000/api/v1
```

## Tài Liệu API

### Xác Thực
- `POST /api/v1/auth/register` - Đăng ký người dùng mới
- `POST /api/v1/auth/login` - Đăng nhập
- `GET /api/v1/auth/logout` - Đăng xuất
- `GET /api/v1/auth/me` - Lấy thông tin người dùng hiện tại

### Sản Phẩm
- `GET /api/v1/products` - Lấy tất cả sản phẩm
- `GET /api/v1/products/search` - Tìm kiếm sản phẩm
- `GET /api/v1/products/:id` - Lấy sản phẩm theo ID
- `POST /api/v1/products` - Tạo sản phẩm mới (Chỉ quản trị viên)
- `PUT /api/v1/products/:id` - Cập nhật sản phẩm (Chỉ quản trị viên)
- `DELETE /api/v1/products/:id` - Xóa sản phẩm (Chỉ quản trị viên)

### Đơn Hàng
- `GET /api/v1/orders` - Lấy đơn hàng của người dùng
- `GET /api/v1/orders/:id` - Lấy đơn hàng theo ID
- `POST /api/v1/orders` - Tạo đơn hàng mới
- `PUT /api/v1/orders/:id` - Cập nhật trạng thái đơn hàng (Chỉ quản trị viên)

### Người Dùng
- `GET /api/v1/users` - Lấy tất cả người dùng (Chỉ quản trị viên)
- `GET /api/v1/users/:id` - Lấy thông tin người dùng theo ID
- `PUT /api/v1/users/:id` - Cập nhật thông tin người dùng
- `DELETE /api/v1/users/:id` - Xóa người dùng (Chỉ quản trị viên)

## Cấu Trúc Frontend

```
src/
├── components/           # Các thành phần UI có thể tái sử dụng
│   └── common/           # Các thành phần chung (Header, Footer, v.v.)
├── context/             # Các React context
│   └── AuthContext.jsx   # Context xác thực
├── pages/               # Các trang
│   ├── admin/           # Trang quản trị
│   │   ├── Products.jsx
│   │   ├── Promotions.jsx
│   │   └── Reports.jsx
│   ├── common/          # Trang công khai
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Shop.jsx
│   └── user/            # Trang dành cho người dùng
│       └── MyOrders.jsx
├── services/            # Các hàm gọi API
│   └── authService.js
├── App.jsx              # Thành phần chính của ứng dụng
└── main.jsx             # Điểm khởi đầu của ứng dụng
```

## Cấu Trúc Backend

```
server/
├── config/
│   ├── cloudinary.js   # Cấu hình Cloudinary
│   └── db.js           # Kết nối cơ sở dữ liệu
├── controllers/        # Các controller xử lý route
│   ├── authController.js
│   ├── orderController.js
│   ├── productController.js
│   └── userController.js
├── middleware/         # Các middleware tùy chỉnh
├── models/             # Các model Mongoose
│   ├── Order.js
│   ├── Product.js
│   ├── User.js
│   └── ...
├── routes/             # Các route API
│   ├── authRoutes.js
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   └── userRoutes.js
├── utils/              # Các hàm tiện ích
│   ├── errorHandler.js
│   ├── jwt.js
│   └── sendEmail.js
└── index.js           # Điểm khởi đầu của server
```

## Luồng Xác Thực

1. **Đăng Ký**
   - Người dùng gửi biểu mẫu đăng ký
   - Máy chủ xác thực thông tin và tạo người dùng mới
   - Tạo JWT token và gửi về cho client
   - Người dùng được tự động đăng nhập

2. **Đăng Nhập**
   - Người dùng gửi thông tin đăng nhập
   - Máy chủ xác minh thông tin
   - Tạo JWT token và lưu vào HTTP-only cookie
   - Chuyển hướng người dùng đến trang chủ

3. **Các Route Được Bảo Vệ**
   - Client gửi JWT token trong mỗi yêu cầu
   - Máy chủ xác minh token và đính kèm thông tin người dùng vào đối tượng yêu cầu
   - Các yêu cầu không được phép sẽ bị chuyển hướng đến trang đăng nhập

## Triển Khai

### Triển Khai Backend
1. Thiết lập cụm MongoDB Atlas hoặc sử dụng dịch vụ MongoDB được quản lý
2. Cấu hình các biến môi trường trên nền tảng lưu trữ
3. Triển khai lên dịch vụ lưu trữ Node.js (ví dụ: Heroku, Render hoặc AWS)

### Triển Khai Frontend
1. Build ứng dụng React:
   ```bash
   cd client
   npm run build
   ```
2. Triển khai thư mục `build` lên dịch vụ lưu trữ tĩnh (ví dụ: Vercel, Netlify hoặc AWS S3)

## Đóng Góp

1. Fork kho lưu trữ
2. Tạo nhánh tính năng mới (`git checkout -b feature/TinhNangMoi`)
3. Commit các thay đổi (`git commit -m 'Thêm tính năng mới'`)
4. Đẩy lên nhánh (`git push origin feature/TinhNangMoi`)
5. Mở Pull Request

## Giấy Phép

Dự án này được cấp phép theo giấy phép MIT - xem tệp [LICENSE](LICENSE) để biết chi tiết.
