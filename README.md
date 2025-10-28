# POSE Project - E-commerce Platform

## Tổng quan
Dự án POSE là một nền tảng thương mại điện tử được xây dựng với React, Node.js và MongoDB. Dự án bao gồm các tính năng quản lý sản phẩm, danh mục, tìm kiếm và lọc sản phẩm với giao diện đẹp và thân thiện với người dùng.

## Tính năng đã triển khai

### Frontend (React + Redux)
- ✅ **Trang danh sách sản phẩm** với giao diện đẹp và responsive
- ✅ **Trang chi tiết sản phẩm** với thông tin đầy đủ
- ✅ **Tìm kiếm và lọc sản phẩm** với nhiều tiêu chí
- ✅ **Redux store** để quản lý state
- ✅ **Pagination** cho danh sách sản phẩm
- ✅ **Component tái sử dụng** (ProductCard, ProductGrid, SearchFilter, Pagination)

### Backend (Node.js + Express)
- ✅ **API sản phẩm** với đầy đủ CRUD operations
- ✅ **API danh mục** với cây danh mục
- ✅ **Tìm kiếm và lọc** với MongoDB aggregation
- ✅ **Xác thực và phân quyền** với JWT
- ✅ **Upload hình ảnh** với Cloudinary
- ✅ **Validation** với express-validator

### Database (MongoDB)
- ✅ **Schema sản phẩm** với đầy đủ thông tin
- ✅ **Schema danh mục** với cây phân cấp
- ✅ **Indexes** để tối ưu hiệu suất
- ✅ **Virtual fields** và methods

## Cấu trúc dự án

```
POSEproject/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Components tái sử dụng
│   │   ├── pages/          # Các trang
│   │   ├── redux/          # Redux store và slices
│   │   ├── services/       # API services
│   │   └── ...
│   └── package.json
├── server/                 # Backend Node.js
│   ├── controllers/        # Controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middlewares/      # Middlewares
│   ├── config/           # Database config
│   └── package.json
└── README.md
```

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm hoặc yarn

### Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd POSEproject
```

2. **Cài đặt dependencies cho server**
```bash
cd server
npm install
```

3. **Cài đặt dependencies cho client**
```bash
cd client
npm install
```

6. **Chạy server**
```bash
npm run dev
```

7. **Chạy client** (terminal mới)
```bash
cd client
npm run dev
```

## Truy cập ứng dụng

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **Admin account**: admin@example.com / admin123

## API Endpoints

### Sản phẩm
- `GET /api/v1/products` - Lấy danh sách sản phẩm
- `GET /api/v1/products/search` - Tìm kiếm sản phẩm với filters
- `GET /api/v1/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/v1/products` - Tạo sản phẩm mới (Admin)
- `PUT /api/v1/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/v1/products/:id` - Xóa sản phẩm (Admin)

### Danh mục
- `GET /api/v1/categories` - Lấy danh sách danh mục
- `GET /api/v1/categories/tree` - Lấy cây danh mục
- `GET /api/v1/categories/root` - Lấy danh mục gốc
- `GET /api/v1/categories/:id` - Lấy chi tiết danh mục
- `POST /api/v1/categories` - Tạo danh mục mới (Admin)
- `PUT /api/v1/categories/:id` - Cập nhật danh mục (Admin)
- `DELETE /api/v1/categories/:id` - Xóa danh mục (Admin)

## Tính năng chính

### 1. Trang danh sách sản phẩm
- Hiển thị sản phẩm dạng grid responsive
- Tìm kiếm theo tên, mô tả, tags
- Lọc theo danh mục, giá, tình trạng
- Sắp xếp theo nhiều tiêu chí
- Pagination với navigation thông minh

### 2. Trang chi tiết sản phẩm
- Hiển thị hình ảnh sản phẩm với gallery
- Thông tin chi tiết và thông số kỹ thuật
- Đánh giá và rating
- Chọn số lượng và thêm vào giỏ hàng
- Wishlist và chia sẻ

### 3. Tìm kiếm và lọc
- Tìm kiếm real-time
- Bộ lọc nâng cao có thể thu gọn/mở rộng
- Lưu trạng thái filter trong Redux
- URL-friendly parameters

### 4. Redux Store
- Quản lý state tập trung
- Async thunks cho API calls
- Optimistic updates
- Error handling

## Công nghệ sử dụng

### Frontend
- **React 18** - UI framework
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Heroicons** - Icons
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Bcryptjs** - Password hashing

## Phát triển thêm

### Tính năng có thể thêm
- [ ] Giỏ hàng và checkout
- [ ] Đánh giá sản phẩm
- [ ] Wishlist persistent
- [ ] So sánh sản phẩm
- [ ] Đề xuất sản phẩm
- [ ] Chat support
- [ ] Push notifications
- [ ] PWA support

### Tối ưu hóa
- [ ] Image lazy loading
- [ ] Infinite scroll
- [ ] Caching strategies
- [ ] SEO optimization
- [ ] Performance monitoring

## Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Liên hệ

- Email: your-email@example.com
- Project Link: [https://github.com/your-username/POSEproject](https://github.com/your-username/POSEproject)