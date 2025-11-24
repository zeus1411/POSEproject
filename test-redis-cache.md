# Hướng dẫn test Redis Cache

## ✅ Redis đã được tích hợp vào:
1. **ProductService** - `getProductById()`, `updateProduct()`, `deleteProduct()`
2. **OrderService** - `getUserOrders()`, `getOrderById()`, `cancelOrder()`

## 🧪 Cách test:

### 1. Kiểm tra Redis đang chạy:
```bash
redis-cli
PING
# Phải trả về: PONG
```

### 2. Xem keys hiện tại:
```bash
# Trong redis-cli
KEYS *
```

### 3. Test cache sản phẩm:

**Bước 1:** Vào trang web hoặc gọi API để xem 1 sản phẩm
```bash
# Lấy ID sản phẩm bất kỳ từ DB
GET http://localhost:3001/api/v1/products/{product_id}
```

**Bước 2:** Check log server - sẽ thấy:
```
❌ Cache MISS: product:abc123def456
💾 Cache SET: product:abc123def456 (TTL: 600s)
```

**Bước 3:** Gọi API lần 2 - sẽ thấy:
```
✅ Cache HIT: product:abc123def456
```

**Bước 4:** Kiểm tra trong Redis:
```bash
# Trong redis-cli
KEYS product:*
# Sẽ hiển thị: 1) "product:abc123def456"

GET product:abc123def456
# Sẽ hiển thị JSON data của sản phẩm
```

### 4. Test cache order:

```bash
# Đăng nhập user trước
POST http://localhost:3001/api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Lấy danh sách orders (với cookie/token)
GET http://localhost:3001/api/v1/orders
```

Check Redis:
```bash
KEYS orders:*
# Sẽ thấy: orders:user:{userId}:{"status":...}
```

### 5. Test invalidate cache:

**Update sản phẩm:**
```bash
PUT http://localhost:3001/api/v1/products/{product_id}
# (cần admin token)
```

Check log:
```
🗑️  Cache DELETE: product:abc123def456
🗑️  Cache DELETE pattern products:list:*: 5 keys
```

Check Redis:
```bash
KEYS product:*
# Sẽ KHÔNG còn key đó nữa
```

## 📊 Xem tất cả cache qua API:

```bash
# Đăng nhập admin
POST http://localhost:3001/api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# Xem stats
GET http://localhost:3001/api/v1/cache/stats

# Response:
{
  "success": true,
  "isRedisReady": true,
  "stats": {
    "total": 15,
    "byType": {
      "products": 3,
      "orders": 5,
      "carts": 2
    }
  }
}
```

## 🔧 Commands hữu ích trong redis-cli:

```bash
# Xem tất cả keys
KEYS *

# Xem keys của products
KEYS product:*

# Xem keys của orders  
KEYS order:*

# Xem giá trị của 1 key
GET product:abc123

# Xem TTL còn lại
TTL product:abc123
# Trả về số giây còn lại

# Xóa 1 key
DEL product:abc123

# Xóa tất cả
FLUSHALL
```

## ⚠️ Lưu ý:

- Cache CHỈ hoạt động khi Redis đang chạy
- Nếu Redis down, app vẫn chạy bình thường (không có cache)
- Cache tự động xóa sau TTL hết hạn:
  - Products: 600s (10 phút)
  - Orders list: 120s (2 phút)
  - Order detail: 180s (3 phút)
