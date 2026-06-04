import React, { useEffect, useState, useRef } from 'react';
import RichTextEditor from '../../../client-eco/components/admin/RichTextEditor';
import { X, Search, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import productService from '../../../client-eco/services/productService';
import { useTheme } from '../../../client-eco/context/ThemeContext';

const BlogForm = ({
  blog,
  categories,
  tags,
  onSubmit,
  onCancel,
  isLoading,
  isAdmin = true
}) => {
  const { isDark } = useTheme();
  const emptyFormData = {
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    coverImage: null,
  };
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

  const toggleTag = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const removeTag = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((id) => id !== tagId)
    }));
  };

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
    } else {
      setFormData(emptyFormData);
      setRelatedProducts([]);
      setSelectedProducts([]);
      setProductQuery('');
      setProductDropdownOpen(false);
      setPreview(null);
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

  const handleSubmit = async (e, submitStatus = null) => {
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
      data.append('status', submitStatus || (isAdmin ? 'PUBLISHED' : 'PENDING'));

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

  return (
    // 🔥 SỬA ĐOẠN NÀY: Gắn sự kiện handleOverlayClick vào lớp nền bao quanh
    <div 
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[100] p-4 overflow-y-auto"
    >
      {/* FORM CHÍNH: Gắn Ref để phân biệt vùng click bên trong */}
      <div 
        ref={modalRef}
        className={`w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh] p-8 relative animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? 'bg-[#051c1c] border border-white/10 text-white' : 'bg-[#FFFDF0] border border-water/40 text-foreground'
        }`}
      >
        {/* HEADER */}
        <div className={`flex justify-between items-center mb-8 border-b pb-4 ${isDark ? 'border-white/5' : 'border-water/20'}`}>
          <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-foreground'}`}>
            {blog ? '✏️ Chỉnh sửa bài viết' : '📝 Tạo bài viết thủy sinh'}
          </h2>
          <button
            type="button"
            onClick={() => setShowConfirmCancel(true)}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-[#0a2828] hover:bg-[#0a2828]/5'
            }`}
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
          {/* TITLE */}
          <div className="flex flex-col gap-1.5">
            <label className={`font-semibold text-sm pl-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tiêu đề</label>
            <input
              type="text"
              className={`w-full rounded-2xl px-5 py-3 transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                isDark 
                  ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10' 
                  : 'bg-white border border-water/30 text-foreground placeholder:text-gray-400 focus:bg-white'
              }`}
              placeholder="Nhập tiêu đề bài viết..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {formData.title && (
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-mono pl-1 mt-1">
                Đường dẫn tĩnh: /blog/{generateSlug(formData.title)}
              </p>
            )}
          </div>

          {/* EXCERPT */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1">
              <label className={`font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tóm tắt ngắn bài viết</label>
              <span className={`text-xs font-mono ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                {formData.excerpt.length}/500 ký tự (Tối đa)
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              className={`w-full rounded-2xl px-5 py-3 transition-all shadow-inner resize-none text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                isDark 
                  ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10' 
                  : 'bg-white border border-water/30 text-foreground placeholder:text-gray-400 focus:bg-white'
              }`}
              placeholder="Nhập một đoạn mô tả ngắn thu hút người đọc..."
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            />
          </div>

          {/* CATEGORY & COVER IMAGE ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className={`font-semibold text-sm pl-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Danh mục</label>
              <div className="relative">
                <select
                  className={`w-full rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer appearance-none ${
                    isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-water/30 text-foreground'
                  }`}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ 
                    backgroundImage: isDark
                      ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")'
                      : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%234b5563\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', 
                    backgroundRepeat: 'no-repeat', 
                    backgroundPosition: 'right 1.25rem center', 
                    backgroundSize: '1.2em' 
                  }}
                >
                  <option value="" className={isDark ? 'bg-[#0a2828] text-gray-400' : 'bg-white text-gray-500'}>-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id} className={isDark ? 'bg-[#0a2828] text-white' : 'bg-white text-foreground'}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`font-semibold text-sm pl-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Ảnh bìa bài viết</label>
              <div className={`relative flex items-center justify-center border border-dashed rounded-2xl p-2 transition-all ${
                isDark ? 'border-white/10 bg-white/[0.02] hover:bg-white/5' : 'border-water/30 bg-water/5 hover:bg-water/10'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={handleFileChange} // 🔥 Đã đổi sang hàm check dung lượng an toàn
                />
                <div className={`text-center py-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Bấm vào đây để tải ảnh bìa</span>
                </div>
              </div>
            </div>
          </div>

          {/* IMAGE PREVIEW DISPLAY */}
          {preview && (
            <div className={`border rounded-[2rem] overflow-hidden p-3 max-w-xl mx-auto flex flex-col gap-2 shadow-inner ${
              isDark ? 'border-white/10 bg-black/10' : 'border-water/20 bg-water/5'
            }`}>
              <img src={preview} alt="preview" className="w-full max-h-60 object-cover rounded-[1.5rem]" />
              <p className={`text-[11px] text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ảnh đã chọn tương thích hoàn toàn hệ thống</p>
            </div>
          )}

          {/* TAGS */}
          <div className="flex flex-col gap-2">
            <label className={`font-semibold text-sm pl-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tags chủ đề</label>
            {formData.tags.length > 0 && (
              <div className={`flex flex-wrap gap-2 mb-1 p-2 rounded-2xl border ${
                isDark ? 'bg-black/10 border-white/5' : 'bg-water/5 border-water/20'
              }`}>
                {formData.tags.map((tagId) => {
                  const tag = tags.find((t) => t._id === tagId);
                  return (
                    <span
                      key={tagId}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
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

            <div className={`flex flex-wrap gap-2 border p-4 rounded-2xl max-h-32 overflow-y-auto shadow-inner ${
              isDark ? 'border-white/10 bg-white/[0.02]' : 'border-water/30 bg-white'
            }`}>
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
                        : (isDark ? 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-gray-800')
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
              <label className={`font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Sản phẩm đính kèm bài viết</label>
              <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
                isDark ? 'text-gray-400 bg-white/5 border-white/5' : 'text-gray-600 bg-water/5 border-water/20'
              }`}>
                Đã ghim: {relatedProducts.length}/{MAX_RELATED_PRODUCTS}
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                className={`w-full rounded-2xl px-5 py-3 text-left text-sm flex items-center justify-between transition-colors shadow-inner ${
                  isDark ? 'bg-white/5 border border-white/10 text-gray-300 hover:border-white/30' : 'bg-white border border-water/30 text-gray-700 hover:border-water'
                }`}
              >
                <span>Mở menu tìm kiếm và chọn sản phẩm...</span>
                <span className={`text-xs transition-transform duration-300 ${productDropdownOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
              </button>

              {productDropdownOpen && (
                <div className={`absolute z-50 mt-2 w-full rounded-2xl shadow-2xl p-4 border ${
                  isDark ? 'bg-[#0a2828] border-white/10' : 'bg-[#FFFDF0] border-water/40'
                }`}>
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Gõ tên hoặc mã sản phẩm (SKU)..."
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                      className={`w-full rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none ${
                        isDark ? 'bg-black/20 border border-white/10 text-white' : 'bg-white border border-water/30 text-foreground'
                      }`}
                    />
                    <Search className={`absolute right-3 top-2.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={16} />
                  </div>

                  <div className={`max-h-56 overflow-y-auto border rounded-xl ${
                    isDark ? 'border-white/5 bg-black/10' : 'border-water/20 bg-water/5'
                  }`}>
                    {isLoadingProducts && <div className={`p-4 text-xs text-center animate-pulse ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Đang quét kho sản phẩm...</div>}
                    {!isLoadingProducts && productResults.length === 0 && <div className={`p-4 text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Không tìm thấy sản phẩm thủy sinh nào</div>}

                    {productResults.map((product) => {
                      const isChecked = selectedProducts.some(p => p._id === product._id);
                      return (
                        <label
                          key={product._id}
                          className={`flex items-center justify-between p-3 border-b cursor-pointer ${
                            isDark ? 'border-white/5 hover:bg-white/5' : 'border-water/10 hover:bg-water/10'
                          }`}
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
                              <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>{product.name}</p>
                              <p className={`text-[10px] font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>SKU: {product.sku}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {(product.minPrice || product.price)?.toLocaleString('vi-VN')}₫
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className={`flex justify-between items-center gap-3 mt-3 pt-3 border-t ${isDark ? 'border-white/5' : 'border-water/10'}`}>
                    <p className={`text-xs pl-1 mb-0 ${isDark ? 'text-cyan-400' : 'text-primary font-semibold'}`}>Đã chọn tạm: {selectedProducts.length}</p>
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
              <div className={`flex flex-wrap gap-2 mt-2 p-3 rounded-2xl border ${
                isDark ? 'bg-black/10 border-white/5' : 'bg-water/5 border-water/20'
              }`}>
                {relatedProducts.map((p) => (
                  <span
                    key={p._id}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                      isDark ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                    }`}
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
            <label className={`font-semibold text-sm pl-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nội dung bài viết</label>
            <div className={`mt-1 border rounded-2xl overflow-hidden bg-white shadow-inner ${
              isDark 
                ? 'border-white/10 invert-[0.90] hue-rotate-[165deg] sepia-[0.3] contrast-[1.1] brightness-[0.95]' 
                : 'border-water/30'
            }`}>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                style={{ minHeight: '300px' }}
              />
            </div>
          </div>

          {/* ACTIONS FORM BOTTOM */}
          <div className={`flex justify-end gap-3 pt-5 mt-8 border-t ${isDark ? 'border-white/5' : 'border-water/20'}`}>
            <button
              type="button"
              onClick={() => setShowConfirmCancel(true)}
              className={`px-5 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                isDark 
                  ? 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5' 
                  : 'border-water/30 text-gray-600 hover:text-gray-800 hover:bg-water/10'
              }`}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={isLoading || isSubmitting}
              onClick={(e) => handleSubmit(e, 'DRAFT')}
              className={`px-5 py-2.5 border rounded-xl text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark 
                  ? 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10' 
                  : 'border-water/40 text-primary hover:bg-water/10'
              }`}
            >
              Lưu bản nháp
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting} // 🔥 Khóa nút gạt khi đang gửi
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading || isSubmitting ? 'Đang lưu bài viết...' : '💾 Lưu & Gửi duyệt'}
            </button>
          </div>
        </form>
      </div>

      {/* 🔥 CẢI TIẾN 3: MODAL XÁC NHẬN HỦY (GLASSMORPHISM ĐỒNG BỘ TRANG WEB) */}
      {showConfirmCancel && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-250 ${
            isDark ? 'bg-[#062323]/95 border border-white/10' : 'bg-[#FFFDF0]/98 border border-water/45'
          }`}
          >
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <AlertCircle size={24} />
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>Rời khỏi trình soạn thảo?</h3>
            </div>
            <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Những thay đổi bạn vừa nhập trên bài viết thủy sinh này chưa được lưu lại và sẽ mất hoàn toàn. Bạn chắc chắn muốn hủy chứ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmCancel(false)}
                className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  isDark ? 'text-gray-300 border-white/5 bg-white/5 hover:bg-white/10' : 'text-gray-600 border-water/20 bg-water/5 hover:bg-water/10'
                }`}
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
