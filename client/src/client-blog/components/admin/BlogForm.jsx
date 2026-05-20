import React, { useEffect, useState, useRef } from 'react';
import RichTextEditor from '../../../client-eco/components/admin/RichTextEditor';
import { X, Search, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import productService from '../../../client-eco/services/productService';

const BlogForm = ({
  blog,
  categories,
  tags,
  onSubmit,
  onCancel,
  isLoading,
  isAdmin = true
}) => {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    coverImage: null,
  });

  const [preview, setPreview] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [productQuery, setProductQuery] = useState('');    
  const [productResults, setProductResults] = useState([]);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // 🔥 CẢI TIẾN 2: Khóa chống spam cục bộ (Local Submission Lock)
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🔥 CẢI TIẾN 3: Quản lý đóng mở Confirmation Modal gõ kính mờ
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  
  const modalRef = useRef(null); // Ref dùng để theo dõi xem user click vào trong hay ngoài Form
  
  const MAX_RELATED_PRODUCTS = 10;
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // Giới hạn 2MB chuẩn cấu hình Server

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        category: blog.category?._id || '',
        tags: blog.tags?.map((t) => t._id) || [],
        coverImage: null,
        status: blog.status || 'DRAFT'
      });
      if (blog?.relatedProducts?.length > 0) {
        setRelatedProducts(blog.relatedProducts); 
      }
      setPreview(blog.coverImage?.url || null);
    }
  }, [blog]);

  // Thu hồi bộ nhớ ObjectURL cũ để tránh rò rỉ bộ nhớ (Memory leak)
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const fetchAllProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await productService.getAllProductsAdmin({ page: 1, limit: 1000 });
      const items = res?.items || res?.products || [];
      setAllProducts(items);
      setProductResults(items);
    } catch (err) {
      console.error(err);
      toast.error('Không tải được danh sách sản phẩm');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (!productDropdownOpen) return;

    if (allProducts.length === 0) {
      fetchAllProducts();
      return;
    }

    const q = productQuery.trim().toLowerCase();
    if (!q) {
      setProductResults(allProducts);
      return;
    }

    setProductResults(
      allProducts.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q)
      )
    );
  }, [productDropdownOpen, productQuery, allProducts]);

  // 🔥 CẢI TIẾN 1: Hàm kiểm tra file ảnh an toàn
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Kiểm tra dung lượng (Max 2MB)
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ảnh quá nặng! Vui lòng chọn ảnh bìa dưới 2MB.");
      e.target.value = ""; // Reset input
      return;
    }

    // 2. Kiểm tra định dạng đuôi file cơ bản tại Client
    const allowedExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedExtensions.includes(file.type)) {
      toast.error("Định dạng file không hợp lệ! Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP.");
      e.target.value = ""; // Reset input
      return;
    }

    // 3. Kiểm tra tính toàn vẹn của ảnh (Chống file lỗi, file hỏng)
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      
      // Nếu ảnh load mượt mà -> File hoàn toàn khỏe mạnh
      img.onload = () => {
        setFormData({ ...formData, coverImage: file });
        setPreview(reader.result); // Lưu chuỗi ảnh Base64 ổn định
      };

      // Nếu ảnh kích hoạt sự kiện onerror -> File đã bị hỏng cấu trúc từ máy
      img.onerror = () => {
        toast.error("⚠️ File ảnh này đã bị lỗi hoặc hỏng cấu trúc! Vui lòng chọn một tấm ảnh khác có thể mở được trên máy tính.");
        setFormData({ ...formData, coverImage: null });
        setPreview(null);
        e.target.value = ""; // Reset input file về trống rỗng
      };
    };
    
    reader.readAsDataURL(file);
  };

  // 🔥 CẢI TIẾN 3: Xử lý khi click vào vùng trống bên ngoài
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      // Kiểm tra nếu form có dữ liệu mới kích hoạt xác nhận, nếu trống thì đóng luôn
      if (formData.title || formData.content || formData.coverImage) {
        setShowConfirmCancel(true);
      } else {
        onCancel();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Khóa nút ngay lập tức để chặn spam trùng bài viết
    if (isLoading || isSubmitting) return;

    if (!formData.category) {
      toast.error("Phải chọn danh mục");
      return;
    }

    if (!blog && !formData.coverImage) {
      toast.error("Vui lòng tải lên ảnh bìa cho bài viết mới");
      return;
    }

    try {
      setIsSubmitting(true); // Bật khóa bảo vệ cục bộ

      const data = new FormData();
      data.append('title', formData.title);
      data.append('excerpt', formData.excerpt);
      data.append('content', formData.content);
      data.append('status', blog?.status || (isAdmin ? 'PUBLISHED' : 'PENDING'));

      if (formData.category) {
        data.append('category', formData.category);
      }

      data.append('tags', JSON.stringify(formData.tags));

      if (formData.coverImage) {
        data.append('coverImage', formData.coverImage);
      }

      if (relatedProducts.length > 0) {
        data.append(
          'relatedProducts',
          JSON.stringify(relatedProducts.map(p => p._id))
        );
      }

      await onSubmit(data);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false); // Mở lại khóa nếu gửi bài lỗi
    }
  };

  const toggleTag = (tagId) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tagId)
        ? formData.tags.filter((t) => t !== tagId)
        : [...formData.tags, tagId]
    });
  };

  const removeTag = (tagId) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagId)
    });
  };

  return (
    // 🔥 SỬA ĐOẠN NÀY: Gắn sự kiện handleOverlayClick vào lớp nền bao quanh
    <div 
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4 overflow-y-auto"
    >
      {/* FORM CHÍNH: Gắn Ref để phân biệt vùng click bên trong */}
      <div 
        ref={modalRef}
        className="bg-[#051c1c]/95 border border-white/10 text-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh] p-8 relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {blog ? '✏️ Chỉnh sửa bài viết' : '📝 Tạo bài viết thủy sinh'}
          </h2>
          <button
            type="button"
            onClick={() => setShowConfirmCancel(true)}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TITLE */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-sm text-gray-300 pl-1">Tiêu đề</label>
            <input
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 transition-all shadow-inner"
              placeholder="Nhập tiêu đề bài viết..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {formData.title && (
              <p className="text-xs text-cyan-400 font-mono pl-1 mt-1">
                Đường dẫn tĩnh: /blog/{generateSlug(formData.title)}
              </p>
            )}
          </div>

          {/* EXCERPT */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="font-semibold text-sm text-gray-300">Tóm tắt ngắn bài viết</label>
              <span className="text-xs text-gray-500 font-mono">
                {formData.excerpt.length}/500 ký tự (Tối đa)
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 transition-all shadow-inner resize-none text-sm leading-relaxed"
              placeholder="Nhập một đoạn mô tả ngắn thu hút người đọc..."
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            />
          </div>

          {/* CATEGORY & COVER IMAGE ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-sm text-gray-300 pl-1">Danh mục</label>
              <div className="relative">
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.2em' }}
                >
                  <option value="" className="bg-[#0a2828] text-gray-400">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id} className="bg-[#0a2828] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-sm text-gray-300 pl-1">Ảnh bìa bài viết</label>
              <div className="relative flex items-center justify-center border border-white/10 border-dashed rounded-2xl bg-white/[0.02] p-2 hover:bg-white/5 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={handleFileChange} // 🔥 Đã đổi sang hàm check dung lượng an toàn
                />
                <div className="text-center py-1 text-sm text-gray-400">
                  <span>Bấm vào đây để tải ảnh bìa</span>
                </div>
              </div>
            </div>
          </div>

          {/* IMAGE PREVIEW DISPLAY */}
          {preview && (
            <div className="border border-white/10 rounded-[2rem] overflow-hidden bg-black/10 p-3 max-w-xl mx-auto flex flex-col gap-2 shadow-inner">
              <img src={preview} alt="preview" className="w-full max-h-60 object-cover rounded-[1.5rem]" />
              <p className="text-[11px] text-gray-400 text-center">Ảnh đã chọn tương thích hoàn toàn hệ thống</p>
            </div>
          )}

          {/* TAGS */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-gray-300 pl-1">Tags chủ đề</label>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-1 p-2 bg-black/10 border border-white/5 rounded-2xl">
                {formData.tags.map((tagId) => {
                  const tag = tags.find((t) => t._id === tagId);
                  return (
                    <span
                      key={tagId}
                      className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {tag?.name}
                      <X
                        size={12}
                        className="cursor-pointer hover:text-rose-400 transition-colors"
                        onClick={() => removeTag(tagId)}
                      />
                    </span>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-2 border border-white/10 p-4 rounded-2xl max-h-32 overflow-y-auto bg-white/[0.02] shadow-inner">
              {tags.map((tag) => {
                const isSelected = formData.tags.includes(tag._id);
                return (
                  <button
                    type="button"
                    key={tag._id}
                    onClick={() => toggleTag(tag._id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RELATED PRODUCTS */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <label className="font-semibold text-sm text-gray-300">Sản phẩm đính kèm bài viết</label>
              <span className="text-xs text-gray-400 font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                Đã ghim: {relatedProducts.length}/{MAX_RELATED_PRODUCTS}
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-left text-sm text-gray-300 hover:border-white/30 flex items-center justify-between transition-colors shadow-inner"
              >
                <span>Mở menu tìm kiếm và chọn sản phẩm...</span>
                <span className={`text-xs transition-transform duration-300 ${productDropdownOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
              </button>

              {productDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-[#0a2828] border border-white/10 rounded-2xl shadow-2xl p-4">
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Gõ tên hoặc mã sản phẩm (SKU)..."
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:outline-none"
                    />
                    <Search className="absolute right-3 top-2.5 text-gray-500" size={16} />
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-white/5 rounded-xl bg-black/10">
                    {isLoadingProducts && <div className="p-4 text-xs text-gray-400 text-center animate-pulse">Đang quét kho sản phẩm...</div>}
                    {!isLoadingProducts && productResults.length === 0 && <div className="p-4 text-xs text-gray-500 text-center">Không tìm thấy sản phẩm thủy sinh nào</div>}

                    {productResults.map((product) => {
                      const isChecked = selectedProducts.some(p => p._id === product._id);
                      return (
                        <label
                          key={product._id}
                          className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              className="rounded accent-emerald-500"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (relatedProducts.length + selectedProducts.length >= MAX_RELATED_PRODUCTS) {
                                    toast.error(`Chỉ được đính kèm tối đa ${MAX_RELATED_PRODUCTS} sản phẩm`);
                                    return;
                                  }
                                  setSelectedProducts([...selectedProducts, product]);
                                } else {
                                  setSelectedProducts(selectedProducts.filter(p => p._id !== product._id));
                                }
                              }}
                            />
                            <div>
                              <p className="text-xs font-medium text-white">{product.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">SKU: {product.sku}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-400">
                            {(product.minPrice || product.price)?.toLocaleString('vi-VN')}₫
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center gap-3 mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs text-cyan-400 pl-1 mb-0">Đã chọn tạm: {selectedProducts.length}</p>
                    <button 
                      disabled={relatedProducts.length >= MAX_RELATED_PRODUCTS || selectedProducts.length === 0}
                      type="button"
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:bg-gray-700"
                      onClick={() => {
                        if (selectedProducts.length === 0) return;
                        const newProducts = selectedProducts.filter(sp => !relatedProducts.some(rp => rp._id === sp._id));

                        if (newProducts.length === 0) {
                          toast.warning("Sản phẩm đã nằm trong danh sách ghim");
                          return;
                        }

                        if (relatedProducts.length + newProducts.length > MAX_RELATED_PRODUCTS) {
                          toast.error(`Vượt quá giới hạn ${MAX_RELATED_PRODUCTS} sản phẩm`);
                          return;
                        }

                        setRelatedProducts([...relatedProducts, ...newProducts]);
                        setSelectedProducts([]);
                        setProductDropdownOpen(false);
                        setProductQuery('');
                      }}
                    >
                      Xác nhận ghim
                    </button>
                  </div>
                </div>
              )}
            </div>

            {relatedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 p-3 bg-black/10 border border-white/5 rounded-2xl">
                {relatedProducts.map((p) => (
                  <span
                    key={p._id}
                    className="flex items-center gap-2 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {p.name} ({p.sku})
                    <X
                      size={12}
                      className="cursor-pointer hover:text-rose-400 transition-colors"
                      onClick={() => setRelatedProducts(relatedProducts.filter(rp => rp._id !== p._id))}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CONTENT EDIT */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-sm text-gray-300 pl-1">Nội dung bài viết</label>
            <div className="mt-1 border border-white/10 rounded-2xl overflow-hidden bg-white shadow-inner invert-[0.90] hue-rotate-[165deg] sepia-[0.3] contrast-[1.1] brightness-[0.95]">
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                style={{ minHeight: '300px' }}
              />
            </div>
          </div>

          {/* ACTIONS FORM BOTTOM */}
          <div className="flex justify-end gap-3 pt-5 border-t border-white/5 mt-8">
            <button
              type="button"
              onClick={() => setShowConfirmCancel(true)}
              className="px-5 py-2.5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting} // 🔥 Khóa nút gạt khi đang gửi
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading || isSubmitting ? 'Đang lưu cấu trúc...' : '💾 Lưu & Gửi duyệt'}
            </button>
          </div>
        </form>
      </div>

      {/* 🔥 CẢI TIẾN 3: MODAL XÁC NHẬN HỦY (GLASSMORPHISM ĐỒNG BỘ TRANG WEB) */}
      {showConfirmCancel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#062323]/95 border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-250">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold text-white">Rời khỏi trình soạn thảo?</h3>
            </div>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Những thay đổi bạn vừa nhập trên bài viết thủy sinh này chưa được lưu lại và sẽ mất hoàn toàn. Bạn chắc chắn muốn hủy chứ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmCancel(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-300 border border-white/5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                Tiếp tục viết
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmCancel(false);
                  onCancel(); // Thoát về trang danh sách bài viết
                }}
                className="px-4 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-md shadow-rose-900/20"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogForm;