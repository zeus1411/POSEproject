# Hướng Dẫn Sử Dụng Trang Đăng Nhập

## Tổng Quan
Đã tạo giao diện đăng nhập và đăng ký đẹp mắt với React, Redux Toolkit và TailwindCSS, tích hợp đầy đủ với backend API.

## Công Nghệ Sử Dụng
- **React 18** - UI Framework
- **Redux Toolkit** - State Management
- **TailwindCSS** - Styling
- **React Router DOM** - Routing
- **Axios** - HTTP Client
- **Heroicons** - Icons

## Cấu Trúc Dự Án

```
client/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx       # Header với user menu
│   │   │   ├── Sidebar.jsx      # Sidebar navigation
│   │   │   └── Footer.jsx       # Footer
│   │   └── Layout.jsx           # Main layout wrapper
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx        # Trang đăng nhập
│   │   │   └── Register.jsx     # Trang đăng ký
│   │   ├── admin/
│   │   │   ├── Products.jsx
│   │   │   ├── Promotions.jsx
│   │   │   └── Reports.jsx
│   │   └── customer/
│       ├── Shop.jsx
│       └── MyOrders.jsx
│   ├── redux/
│   │   ├── slices/
│   │   │   └── authSlice.js     # Auth state management
│   │   └── store.js             # Redux store
│   ├── services/
│   │   ├── api.js               # Axios instance
│   │   └── authService.js       # Auth API calls
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env                         # Environment variables
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Tính Năng Đã Triển Khai

### 1. Trang Đăng Nhập (`/login`)
- Form đăng nhập với email và password
- Hiển thị/ẩn mật khẩu
- Validation và error handling
- Loading state khi đang xử lý
- Ghi nhớ đăng nhập
- Link đến trang đăng ký và quên mật khẩu
- Gradient background và animations

### 2. Trang Đăng Ký (`/register`)
- Form đăng ký với username, email, password
- Xác nhận mật khẩu
- Hiển thị/ẩn mật khẩu
- Validation
- Link đến trang đăng nhập

### 3. Redux State Management
- **authSlice**: Quản lý trạng thái authentication
  - `login`: Đăng nhập user
  - `register`: Đăng ký user mới
  - `logout`: Đăng xuất
  - `getCurrentUser`: Lấy thông tin user hiện tại
- Auto-redirect sau khi đăng nhập thành công

### 4. API Integration
- Axios instance với interceptors
- Auto-attach JWT token vào headers
- Handle 401 errors (auto logout)
- Cookie support với `withCredentials`

### 5. UI/UX Features
- **Responsive Design**: Hoạt động tốt trên mọi thiết bị
- **Gradient Colors**: Màu sắc nhẹ nhàng, gradient từ blue đến purple
- **Icons**: Sử dụng Heroicons cho icons đẹp
- **Animations**: Smooth transitions và hover effects
- **Loading States**: Spinner khi đang xử lý
- **Error Messages**: Hiển thị lỗi rõ ràng

## API Endpoints

### Backend Routes (đã có sẵn)
```javascript
POST /api/v1/auth/register  // Đăng ký
POST /api/v1/auth/login     // Đăng nhập
GET  /api/v1/auth/logout    // Đăng xuất (protected)
GET  /api/v1/auth/me        // Lấy user hiện tại (protected)
```

### Request/Response Format

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "user": {
    "userId": "...",
    "username": "...",
    "email": "...",
    "role": "user"
  },
  "token": "jwt_token_here",
  "message": "Login successful"
}
```

## Cách Chạy

### 1. Cài Đặt Dependencies
```bash
cd client
npm install
```

### 2. Cấu Hình Environment
File `.env` đã được tạo với:
```
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Chạy Development Server
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5177`

### 4. Chạy Backend Server
```bash
cd ../server
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

## URLs

- **Trang chủ:** `http://localhost:5177/`
- **Đăng nhập:** `http://localhost:5177/login`
- **Đăng ký:** `http://localhost:5177/register`
- **API Server:** `http://localhost:5000/api/v1/auth`

### Protected Routes
- **Cửa hàng:** `http://localhost:5177/shop`
- **Đơn hàng:** `http://localhost:5177/orders`
- **Admin Products:** `http://localhost:5177/admin/products` - Quản lý sản phẩm (admin)
- `/admin/promotions` - Quản lý khuyến mãi (admin)
- `/admin/reports` - Báo cáo (admin)

## State Management Flow

```
User Action (Login Form Submit)
    ↓
Dispatch login() thunk
    ↓
Call authService.login()
    ↓
API Request to /auth/login
    ↓
Save token & user to localStorage
    ↓
Update Redux state
    ↓
Redirect to home page
```

## Styling với TailwindCSS

### Color Palette
- **Primary**: Blue gradient (#0ea5e9 - #0284c7)
- **Secondary**: Purple (#9333ea)
- **Background**: Light gray (#f9fafb)
- **Text**: Dark gray (#111827)

### Key Classes Used
- `bg-gradient-to-r from-primary-600 to-purple-600` - Gradient buttons
- `shadow-xl rounded-2xl` - Card styling
- `focus:ring-2 focus:ring-primary-500` - Focus states
- `transition duration-150 ease-in-out` - Smooth animations

## Lưu Ý Quan Trọng

1. **CORS**: Đảm bảo server đã cấu hình CORS cho `http://localhost:5177`
2. **Cookies**: Server phải set `sameSite: 'strict'` và client dùng `withCredentials: true`
3. **JWT Secret**: Server cần có `JWT_SECRET` trong `.env`
4. **Database**: MongoDB phải đang chạy

## Lint Warnings
Các warning về `@tailwind` trong CSS là bình thường - đây là directives của TailwindCSS và sẽ được xử lý đúng khi build.

## Next Steps (Tùy Chọn)

1. **Protected Routes**: Tạo PrivateRoute component để bảo vệ routes
2. **Role-based Access**: Phân quyền admin/user
3. **Forgot Password**: Trang quên mật khẩu
4. **Email Verification**: Xác thực email
5. **Social Login**: Đăng nhập qua Google/Facebook
6. **Remember Me**: Lưu session lâu hơn

## Troubleshooting

### Lỗi CORS
Thêm vào server `index.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5177',
  credentials: true
}));
```

### Token không được gửi
Kiểm tra `withCredentials: true` trong axios config

### Redirect loop
Kiểm tra logic trong `useEffect` của Login.jsx

---

**Tác giả**: Cascade AI  
**Ngày tạo**: October 2025  
**Version**: 1.0.0
