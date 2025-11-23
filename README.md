# POSE Project - Modern E-commerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-lightgrey)](https://expressjs.com/)

## Overview
POSE is a modern, full-featured e-commerce platform built with a React.js frontend and Node.js/Express backend, powered by MongoDB. The application provides a seamless online shopping experience with a beautiful, responsive user interface and robust backend services.

## Key Features

### 🛍️ Customer Facing
- **Product Browsing**
  - Responsive product catalog with filtering and sorting
  - Advanced search functionality
  - Product categories and tags
  - Product reviews and ratings

- **Shopping Experience**
  - Shopping cart management
  - Wishlist functionality
  - Order tracking
  - Multiple payment methods (VNPay, Stripe)

- **User Account**
  - User registration and authentication
  - Profile management
  - Order history
  - Address book

### 🛠️ Admin Dashboard
- **Product Management**
  - Add/edit/delete products
  - Manage inventory
  - Handle product categories and attributes

- **Order Management**
  - Process orders
  - Update order status
  - Handle returns and refunds

- **User Management**
  - Manage customer accounts
  - Handle user roles and permissions
  - View user activity

- **Analytics**
  - Sales reports
  - Customer insights
  - Inventory management

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **State Management**: Redux Toolkit
- **Styling**: TailwindCSS + Emotion
- **UI Components**: Material-UI, Headless UI, Hero Icons
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios
- **Internationalization**: i18next

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, bcryptjs
- **File Upload**: Multer, Cloudinary
- **Payment Integration**: VNPay, Stripe
- **Email**: Nodemailer
- **Validation**: express-validator
- **Logging**: Winston

### DevOps
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: N/A
- **Logging**: Winston + CloudWatch

## 🏗️ Project Structure

```
POSEproject/
├── client/                      # Frontend React (Vite)
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── assets/             # Images, icons, styles
│   │   ├── components/          # Reusable components
│   │   │   ├── common/         # Common components
│   │   │   └── ui/             # UI components
│   │   ├── context/            # React Context
│   │   ├── pages/              # Page components
│   │   ├── redux/              # Redux store and slices
│   │   ├── services/           # API services
│   │   ├── utils/              # Utility functions
│   │   ├── App.jsx             # Root component
│   │   └── main.jsx            # App entry point
│   ├── .env.development        # Frontend environment variables
│   ├── .env.production         # Production environment variables
│   ├── vite.config.js          # Vite configuration
│   └── package.json            # Frontend dependencies
│
├── server/                     # Backend Node.js
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── middlewares/           # Express middlewares
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── utils/                 # Utility functions
│   ├── .env                  # Environment variables
│   └── package.json          # Backend dependencies
│
├── docker/                    # Docker configuration
│   ├── nginx/                # Nginx configuration
│   ├── mongo/                # MongoDB configuration
│   └── Dockerfile            # Dockerfile for the application
│
├── .github/workflows/        # GitHub Actions workflows
├── docker-compose.yml        # Docker Compose configuration
├── .gitignore               # Git ignore file
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- **Option 1 (Recommended)**: Docker Desktop for Windows
- **Option 2**: Node.js 18+, MongoDB 7.0+, npm 9+

### 🐳 Quick Start with Docker (Recommended)

**Xem hướng dẫn chi tiết tại [QUICKSTART.md](QUICKSTART.md)**

```powershell
# 1. Clone repository (nếu chưa có)
git clone https://github.com/zeus1411/POSEproject.git
cd POSEproject

# 2. Build và start Docker containers
docker-compose up -d --build

# 3. Xem logs
docker-compose logs -f

# 4. Truy cập ứng dụng
# Frontend: http://localhost
# Backend API: http://localhost:3000/api/v1
```

**Dừng containers:**
```powershell
docker-compose down
```

### 💻 Local Development (Không dùng Docker)

1. **Clone repository**
   ```powershell
   git clone https://github.com/zeus1411/POSEproject.git
   cd POSEproject
   ```

2. **Setup Backend**
   ```powershell
   cd server
   npm install
   npm run dev
   ```

3. **Setup Frontend** (terminal mới)
   ```powershell
   cd client
   npm install
   npm run dev
   ```

4. **Truy cập ứng dụng**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api/v1
   - Admin Dashboard: http://localhost:5173/admin

### Environment Variables

#### Backend (server/.env)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/pose_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# VNPay
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/payment/vnpay_return

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

#### Frontend (client/.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## 🐳 Docker Setup

### Quick Start

**Xem chi tiết tại [QUICKSTART.md](QUICKSTART.md) hoặc [README.Docker.md](README.Docker.md)**

```powershell
# Build và start tất cả services
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Dừng containers
docker-compose down
```

**Truy cập ứng dụng:**
- Frontend: http://localhost
- Backend API: http://localhost:3000/api/v1

### Docker Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │    Backend      │      │    MongoDB      │
│   (Nginx)       │─────▶│   (Node.js)     │─────▶│   Database      │
│   Port: 80      │      │   Port: 3000    │      │   Port: 27017   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Services
- **frontend**: React + Nginx (container: pose_frontend)
- **backend**: Node.js + Express (container: pose_backend)
- **mongodb**: MongoDB 7.0 (container: pose_mongodb)

Xem hướng dẫn đầy đủ tại [README.Docker.md](README.Docker.md).

## 🛠 API Documentation

API documentation is available at `http://localhost:3000/api-docs` when running the application in development mode.

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Forgot password
- `PUT /api/auth/resetpassword/:resettoken` - Reset password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/reviews` - Add product review

### Orders
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/myorders` - Get logged in user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered (Admin)

## 🧪 Testing

### Running Tests
```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd ../client
npm test
```

### Linting
```bash
# Backend
cd server
npm run lint

# Frontend
cd ../client
npm run lint
```

## 🚀 Deployment

### Prerequisites
- Server with Node.js 18+ and MongoDB 7.0+
- Nginx (recommended)
- PM2 (for process management)

### Steps
1. **Build the frontend**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Set up the backend**
   ```bash
   cd ../server
   npm install --production
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           root /path/to/client/dist;
           try_files $uri /index.html;
       }

       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Start the application**
   ```bash
   # Start backend with PM2
   cd server
   pm2 start npm --name "pose-backend" -- start
   
   # Set PM2 to start on system boot
   pm2 startup
   pm2 save
   ```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Material-UI](https://mui.com/)
- And all other open-source libraries and tools used in this project.

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
