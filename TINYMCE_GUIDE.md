# Hướng dẫn sử dụng TinyMCE Rich Text Editor cho Mô tả Sản phẩm

## 🎯 Tổng quan

Đã tích hợp thành công **TinyMCE WYSIWYG Editor** vào form thêm/sửa sản phẩm để:
- ✅ Giữ nguyên định dạng xuống dòng, gạch đầu dòng
- ✅ Thêm hình ảnh trực tiếp vào mô tả
- ✅ Định dạng văn bản (bold, italic, color, alignment...)
- ✅ Tạo danh sách có số thứ tự hoặc bullet points
- ✅ Thêm link, bảng và nhiều tính năng khác

## 📁 Files đã thay đổi

### Frontend (Client)

1. **`client/src/components/admin/RichTextEditor.jsx`** (MỚI)
   - Component wrapper cho TinyMCE Editor
   - Cấu hình toolbar và plugins
   - Xử lý upload ảnh vào description

2. **`client/src/components/admin/ProductForm.jsx`** (CẬP NHẬT)
   - Thay thế `<textarea>` bằng `<RichTextEditor>`
   - Cải thiện validation để kiểm tra text content thực sự
   - Import RichTextEditor component

3. **`client/src/pages/product/ProductDetail.jsx`** (CẬP NHẬT)
   - Sử dụng `dangerouslySetInnerHTML` để render HTML description
   - Hiển thị đúng định dạng rich text

### Backend (Server)

4. **`server/routes/productRoutes.js`** (CẬP NHẬT)
   - Thêm endpoint `POST /api/v1/products/upload-description-image`
   - Import controller `uploadDescriptionImage`

5. **`server/controllers/productController.js`** (CẬP NHẬT)
   - Thêm controller `uploadDescriptionImage` để xử lý upload ảnh cho TinyMCE

### Dependencies

6. **`client/package.json`** (CẬP NHẬT)
   - Đã cài đặt: `@tinymce/tinymce-react`

## 🚀 Cách sử dụng

### 1. Thêm/Sửa sản phẩm với TinyMCE

Khi vào trang Admin → Products → Add/Edit Product:

1. **Nhập mô tả** vào editor WYSIWYG (không còn là textarea đơn giản)
2. **Sử dụng toolbar** để định dạng:
   - **Bold/Italic**: Làm đậm/nghiêng chữ
   - **Bullet/Number Lists**: Tạo danh sách
   - **Image**: Chèn ảnh từ máy tính
   - **Link**: Thêm đường dẫn
   - **Alignment**: Căn trái/giữa/phải/đều

3. **Chèn ảnh vào mô tả**:
   - Click nút **Image** (🖼️) trên toolbar
   - Chọn "Upload" tab
   - Chọn file ảnh từ máy tính
   - Ảnh sẽ tự động upload lên Cloudinary và chèn vào mô tả

### 2. Paste nội dung có định dạng

Bạn có thể **copy-paste** từ Word, Google Docs hoặc các trang web:

**Ví dụ nội dung bạn đã cung cấp:**

```
1. Giới thiệu chung về ốc nerita
Ốc Nerita có tên khoa học là Neritina natalensis...
- Tên khoa học: Neritina natalensis
- Chi: Neritina
- Họ: Neritidae

2. Cách chăm sóc ốc nerita
Tình trạng sức khỏe của chúng phụ thuộc...
```

**Kết quả**: Định dạng sẽ được GIỮ NGUYÊN với:
- Số thứ tự (1, 2, 3...)
- Gạch đầu dòng (•)
- Xuống dòng
- Bold/Italic nếu có

### 3. Xem sản phẩm trên frontend

Khi khách hàng xem chi tiết sản phẩm, mô tả sẽ hiển thị đầy đủ định dạng HTML như bạn đã nhập.

## ⚙️ Cấu hình TinyMCE

### Toolbar hiện tại

```javascript
'undo redo | blocks | bold italic forecolor | 
alignleft aligncenter alignright alignjustify | 
bullist numlist outdent indent | removeformat | image link | help'
```

### Plugins được bật

- `advlist`: Danh sách nâng cao
- `autolink`: Tự động tạo link
- `lists`: Bullet và numbered lists
- `link`: Chèn đường dẫn
- `image`: Upload và chèn ảnh
- `charmap`: Ký tự đặc biệt
- `preview`: Xem trước
- `searchreplace`: Tìm kiếm và thay thế
- `visualblocks`: Hiển thị block elements
- `code`: Xem mã nguồn HTML
- `fullscreen`: Chế độ toàn màn hình
- `table`: Tạo bảng
- `wordcount`: Đếm từ

## 🔒 Bảo mật

### Upload ảnh trong mô tả

- **Endpoint**: `POST /api/v1/products/upload-description-image`
- **Authentication**: Yêu cầu đăng nhập + role Admin
- **Storage**: Cloudinary (như ảnh sản phẩm chính)
- **Validation**: Chỉ chấp nhận file ảnh (multer middleware)

### XSS Protection

TinyMCE tự động sanitize nội dung nguy hiểm, nhưng vẫn cần lưu ý:
- Chỉ Admin mới được nhập mô tả
- Không cho phép user thường chỉnh sửa

## 🎨 Customization

### Thay đổi toolbar

Chỉnh sửa trong `RichTextEditor.jsx`:

```javascript
toolbar: 'undo redo | blocks | bold italic underline | ...'
```

### Thay đổi chiều cao editor

```javascript
init={{
  height: 500, // Thay đổi từ 400 sang 500
  ...
}}
```

### Thêm plugin mới

```javascript
plugins: [
  'advlist', 'autolink', 'lists', 
  'emoticons', // ← Plugin mới
  ...
]
```

## 📝 Validation

Form vẫn validate mô tả:

```javascript
// Kiểm tra text content thực sự (không chỉ HTML tags rỗng)
const tempDiv = document.createElement('div');
tempDiv.innerHTML = formData.description;
const textContent = tempDiv.textContent || tempDiv.innerText || '';

if (!textContent.trim()) {
  newErrors.description = 'Mô tả sản phẩm là bắt buộc';
}
```

Điều này đảm bảo admin không thể submit form với description chỉ có tags `<p></p>` rỗng.

## 🧪 Testing

### Test case 1: Paste nội dung có định dạng
1. Copy đoạn text có số thứ tự và bullet points
2. Paste vào editor
3. Lưu sản phẩm
4. Kiểm tra trang chi tiết → Định dạng giữ nguyên ✅

### Test case 2: Upload ảnh vào mô tả
1. Click nút Image trên toolbar
2. Upload file ảnh
3. Ảnh hiển thị trong editor
4. Lưu sản phẩm
5. Kiểm tra trang chi tiết → Ảnh hiển thị đúng ✅

### Test case 3: Validation
1. Để trống editor
2. Click Save
3. Hiển thị lỗi "Mô tả sản phẩm là bắt buộc" ✅

### Test case 4: Edit sản phẩm cũ
1. Mở sản phẩm có description dạng plain text
2. Editor hiển thị text cũ
3. Thêm định dạng mới
4. Save → Cập nhật thành công ✅

## 🐛 Troubleshooting

### Lỗi: TinyMCE không load

**Giải pháp**: TinyMCE sử dụng CDN (không cần API key với apiKey="no-api-key"). Nếu offline, cần:

```bash
npm install tinymce
```

Và thay đổi trong `RichTextEditor.jsx`:

```javascript
import 'tinymce/tinymce';
// Import theme và plugins cần thiết
```

### Lỗi: Upload ảnh thất bại

**Kiểm tra**:
1. Token đã được gửi trong header chưa?
2. User có role Admin không?
3. Endpoint `/api/v1/products/upload-description-image` có hoạt động không?

**Debug**:
```javascript
// Trong RichTextEditor.jsx
console.log('Upload response:', result);
```

### Lỗi: Định dạng bị mất khi hiển thị

**Nguyên nhân**: Chưa dùng `dangerouslySetInnerHTML`

**Giải pháp**: Đã fix trong `ProductDetail.jsx`:
```javascript
<div dangerouslySetInnerHTML={{ __html: currentProduct.description }} />
```

## 📊 So sánh Before/After

### ❌ TRƯỚC (textarea)
```
Input: 
1. Giới thiệu
   - Điểm 1
   - Điểm 2

Output trên web:
1. Giới thiệu - Điểm 1 - Điểm 2 (tất cả trên 1 dòng)
```

### ✅ SAU (TinyMCE)
```
Input: 
1. Giới thiệu
   - Điểm 1
   - Điểm 2

Output trên web:
1. Giới thiệu
   • Điểm 1
   • Điểm 2
(Giữ nguyên định dạng + có thể thêm ảnh)
```

## 🎓 Tài liệu tham khảo

- TinyMCE Docs: https://www.tiny.cloud/docs/
- React Integration: https://www.tiny.cloud/docs/tinymce/6/react-ref/
- Image Upload: https://www.tiny.cloud/docs/tinymce/6/file-image-upload/

---

**✅ Hoàn thành!** Giờ bạn có thể nhập mô tả sản phẩm với định dạng đầy đủ và chèn ảnh minh họa.
