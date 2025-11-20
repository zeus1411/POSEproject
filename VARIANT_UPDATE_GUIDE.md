# Product Variants - Hướng dẫn sử dụng & Debug

## ✅ Thay đổi đã thực hiện

### 1. **Bỏ SKU khỏi Variants**
- ✅ Xóa field `sku` trong `Product.variants[]` schema
- ✅ Bỏ SKU input trong Admin UI
- ✅ Bỏ SKU display trong Customer View
- 🎯 **SKU chỉ dùng cho sản phẩm chính** (phân loại theo category)

### 2. **Fix cập nhật Variants**
- ✅ Thêm logs chi tiết trong `createProduct` và `updateProduct`
- ✅ Fix logic: Chỉ clear variants khi `hasVariants = false` (tắt checkbox)
- ✅ Nếu không gửi `hasVariants`, giữ nguyên variants cũ

---

## 🧪 Test Cases

### **Test 1: Tạo sản phẩm mới với Variants**
```
Admin → Quản lý sản phẩm → Thêm sản phẩm
1. Nhập tên, SKU (sản phẩm chính), giá, stock
2. Kích hoạt "Kích hoạt variants" ✓
3. Thêm option: "Kích thước" → Values: ["YBG-300", "YBG-500"]
4. Click "Thêm variant" 2 lần
5. Variant #1: Chọn "YBG-300", giá 100k, stock 50
6. Variant #2: Chọn "YBG-500", giá 120k, stock 30
7. Click "Tạo"

✅ Expected: Product được tạo với 2 variants
```

### **Test 2: Cập nhật Variants của sản phẩm có sẵn**
```
Admin → Quản lý sản phẩm → Sửa sản phẩm có variants
1. Thấy options và variants hiện có
2. Sửa giá variant #1: 100k → 110k
3. Sửa stock variant #2: 30 → 25
4. Thêm variant #3: "YBG-700", giá 150k, stock 20
5. Click "Cập nhật"

✅ Expected: 
- Variant #1 giá = 110k
- Variant #2 stock = 25
- Variant #3 được thêm mới
- Variants cũ KHÔNG bị mất
```

### **Test 3: Tắt Variants (chuyển về sản phẩm đơn giản)**
```
Admin → Sửa sản phẩm có variants
1. Bỏ tick "Kích hoạt variants" ✗
2. Click "Cập nhật"

✅ Expected:
- hasVariants = false
- options = []
- variants = []
- Sản phẩm dùng giá/stock chính
```

### **Test 4: Customer chọn variants**
```
User → Chi tiết sản phẩm có variants
1. Thấy section "Kích thước" với buttons
2. Click [YBG-300]
3. Thấy giá + stock update
4. Thấy info box: "Kích thước: YBG-300 | Còn 50 sản phẩm"
5. Button "Thêm vào giỏ hàng" enabled
6. Click "Thêm vào giỏ hàng"

✅ Expected: 
- Variant được add vào cart
- Cart item có variantId
```

---

## 🔍 Debug Logs

### **Kiểm tra Server Logs**
Sau khi click "Tạo" hoặc "Cập nhật", check terminal server:

```bash
# Terminal: node (server)
# Expected logs:

# CREATE Product:
CREATE - Parsed options: [ { name: 'Kích thước', values: ['YBG-300', 'YBG-500'] } ]
CREATE - Parsed variants count: 2
CREATE - Final payload: { hasVariants: true, optionsCount: 1, variantsCount: 2 }

# UPDATE Product:
updateProduct - Request body: { hasVariants: 'true', optionsType: 'string', variantsType: 'string', variantsLength: 2 }
Parsed options: [ { name: 'Kích thước', values: [...] } ]
Parsed variants count: 2
First variant sample: { optionValues: { 'Kích thước': 'YBG-300' }, price: 100000, stock: 50, isActive: true }
Final update payload: { hasVariants: true, optionsCount: 1, variantsCount: 2 }
```

### **Kiểm tra MongoDB**
```bash
# Mở MongoDB Compass
# Collection: products
# Tìm sản phẩm vừa tạo/cập nhật
# Check fields:

{
  "sku": "PROD-001",  // SKU sản phẩm chính
  "hasVariants": true,
  "options": [
    {
      "name": "Kích thước",
      "values": ["YBG-300", "YBG-500"]
    }
  ],
  "variants": [
    {
      "_id": ObjectId("..."),
      "optionValues": {
        "Kích thước": "YBG-300"
      },
      "price": 110000,
      "stock": 50,
      "isActive": true
      // ❌ KHÔNG có field "sku"
    },
    {
      "_id": ObjectId("..."),
      "optionValues": {
        "Kích thước": "YBG-500"
      },
      "price": 120000,
      "stock": 25,
      "isActive": true
    }
  ]
}
```

---

## 🐛 Troubleshooting

### **Vấn đề: Variants bị mất khi update**
**Nguyên nhân:**
- Frontend gửi `hasVariants = false` hoặc không gửi variants
- Backend tự động clear variants

**Giải pháp:**
✅ Đã fix: Kiểm tra `hasVariants` trước khi clear
✅ Thêm logs để track data flow

**Cách verify:**
1. Mở DevTools → Network tab
2. Click "Cập nhật" sản phẩm
3. Tìm request PUT `/api/v1/products/:id`
4. Check FormData payload:
   - `hasVariants`: "true"
   - `options`: "[{...}]"
   - `variants`: "[{...}]"

### **Vấn đề: Variants không hiện trên Customer View**
**Nguyên nhân:**
- Product không có `hasVariants = true`
- Hoặc `options` array rỗng

**Giải pháp:**
1. Check MongoDB: Đảm bảo `hasVariants: true`
2. Check `options` có data
3. Verify `variants` có ít nhất 1 item `isActive: true`

### **Vấn đề: Click variant button không hoạt động**
**Nguyên nhân:**
- Logic `isOptionAvailable()` quá strict
- Hoặc không có variant nào match

**Giải pháp:**
✅ Đã fix: Cải thiện logic check availability
✅ Allow selection khi có ít nhất 1 variant khớp

---

## 📝 Checklist sau khi deploy

- [ ] Server khởi động không lỗi
- [ ] Client build thành công
- [ ] Tạo sản phẩm mới với variants OK
- [ ] Cập nhật variants OK (không bị mất data)
- [ ] Customer view hiển thị variants
- [ ] Click chọn variants hoạt động
- [ ] Add to cart với variant thành công
- [ ] MongoDB có đúng structure (không có sku trong variants)

---

## 🎯 Next Steps (Optional Enhancement)

1. **Thêm ảnh riêng cho từng variant**
   - Upload image cho variant
   - Hiển thị ảnh khi customer chọn variant

2. **Bulk import variants từ Excel**
   - Admin upload file Excel
   - Tự động tạo variants

3. **Variant stock alert**
   - Email admin khi variant stock < threshold
   - Badge "Sắp hết" trên customer view

4. **Variant pricing rules**
   - Discount theo variant
   - Flash sale cho variant cụ thể
