import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useSelector } from 'react-redux';
import ProductVariantsManager from './ProductVariantsManager';
import RichTextEditor from './RichTextEditor';
import { useTheme } from '../../context/ThemeContext';

const ProductForm = ({ product, categories, onSubmit, onCancel, isLoading }) => {
  const { isDark } = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    status: 'ACTIVE',
    images: [],
    hasVariants: false,
    options: [],
    variants: []
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // ✅ Track existing images
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        categoryId: product.categoryId?._id || '',
        status: product.status || 'ACTIVE',
        images: product.images || [],
        hasVariants: product.hasVariants || false,
        options: product.options || [],
        variants: product.variants || []
      });
      // ✅ Separate existing images from new uploads
      setExistingImages(product.images || []);
      setImagePreview([]);
      setImageFiles([]);
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // ✅ Append new files instead of replacing
    setImageFiles(prev => [...prev, ...files]);

    // Create preview URLs for new files
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...previews]);
  };

  const removeExistingImage = (index) => {
    // ✅ Remove from existing images
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    // ✅ Remove from new uploads
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.sku.trim()) newErrors.sku = 'SKU là bắt buộc';
    
    // Validate description - check if there's actual text content (not just HTML tags)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formData.description;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    if (!textContent.trim()) {
      newErrors.description = 'Mô tả sản phẩm là bắt buộc';
    }
    
    // ✅ Chỉ validate price và stock khi KHÔNG có variants
    if (!formData.hasVariants) {
      if (!formData.price) newErrors.price = 'Giá là bắt buộc';
      if (formData.price < 0) newErrors.price = 'Giá không thể âm';
      if (!formData.stock) newErrors.stock = 'Tồn kho là bắt buộc';
      if (formData.stock < 0) newErrors.stock = 'Tồn kho không thể âm';
    } else {
      // ✅ Validate variants khi có variants
      if (!formData.variants || formData.variants.length === 0) {
        newErrors.variants = 'Vui lòng thêm ít nhất một variant';
      } else {
        // ✅ Check for duplicate variants
        const variantKeys = new Set();
        let hasDuplicate = false;
        
        formData.variants.forEach((variant, idx) => {
          if (variant.optionValues) {
            const key = JSON.stringify(
              Object.entries(variant.optionValues).sort()
            );
            
            if (variantKeys.has(key)) {
              hasDuplicate = true;
            } else {
              variantKeys.add(key);
            }
          }
        });
        
        if (hasDuplicate) {
          newErrors.variants = 'Có variant trùng lặp. Vui lòng kiểm tra và sửa các variant có cùng giá trị tùy chọn.';
        }
      }
    }
    
    if (!formData.categoryId) newErrors.categoryId = 'Danh mục là bắt buộc';
    
    // ✅ Check total images (existing + new)
    const totalImages = existingImages.length + imagePreview.length;
    if (!product && totalImages === 0) {
      newErrors.images = 'Vui lòng tải lên ít nhất một ảnh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('sku', formData.sku);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('stock', formData.stock);
    submitData.append('categoryId', formData.categoryId);
    submitData.append('status', formData.status);

    // ✅ Send variants data
    submitData.append('hasVariants', formData.hasVariants);
    if (formData.hasVariants) {
      submitData.append('options', JSON.stringify(formData.options));
      submitData.append('variants', JSON.stringify(formData.variants));
    }

    // ✅ Send existing images that weren't deleted
    if (product && existingImages.length > 0) {
      submitData.append('existingImages', JSON.stringify(existingImages));
    }

    // ✅ Add new image files
    imageFiles.forEach(file => {
      submitData.append('images', file);
    });

    onSubmit(submitData);
  };

  const handleVariantsUpdate = (variantsData) => {
    setFormData(prev => ({
      ...prev,
      hasVariants: variantsData.hasVariants,
      options: variantsData.options,
      variants: variantsData.variants
    }));
  };

  // Tính tổng tồn kho từ variants
  useEffect(() => {
    if (formData.hasVariants && formData.variants && formData.variants.length > 0) {
      const totalStock = formData.variants
        .filter(v => v.isActive)
        .reduce((sum, variant) => sum + (parseInt(variant.stock) || 0), 0);
      
      setFormData(prev => ({
        ...prev,
        stock: totalStock
      }));
    }
  }, [formData.hasVariants, formData.variants]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center z-[100] overflow-y-auto pt-8 pb-8 transition-all duration-300">
      <div className={`glass-panel solid-modal w-full max-w-2xl m-4 overflow-hidden rounded-3xl border shadow-2xl transition-all duration-300 ${
        isDark ? 'border-white/10 text-white shadow-black/40' : 'border-water/40 text-slate-800 shadow-slate-900/10'
      }`}>
        <div className={`flex justify-between items-center p-5 border-b transition-colors duration-300 ${
          isDark ? 'border-white/5 bg-white/5' : 'border-water/10 bg-water/5'
        }`}>
          <h2 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {product ? '✏️ Chỉnh sửa sản phẩm' : '✨ Tạo sản phẩm mới'}
          </h2>
          <button
            onClick={onCancel}
            className={`transition-colors duration-200 ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Name */}
          <div>
            <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
              Tên sản phẩm *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                errors.name 
                  ? 'border-red-500 bg-red-500/5' 
                  : (isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-white border-water/30 text-slate-800 focus:bg-slate-50')
              }`}
              placeholder="Nhập tên sản phẩm"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* SKU and Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.sku 
                    ? 'border-red-500 bg-red-500/5' 
                    : (isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-white border-water/30 text-slate-800 focus:bg-slate-50')
                }`}
                placeholder="Nhập SKU"
              />
              {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
            </div>

            {!formData.hasVariants && (
              <div>
                <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
                  Giá (₫) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                    errors.price 
                      ? 'border-red-500 bg-red-500/5' 
                      : (isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-white border-water/30 text-slate-800 focus:bg-slate-50')
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            )}
          </div>

          {/* Stock and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
                Tồn kho *
                {formData.hasVariants && (
                  <span className={`ml-2 text-xs italic ${isDark ? 'text-cyan-400' : 'text-primary'}`}>(Tự động tính)</span>
                )}
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                disabled={formData.hasVariants}
                className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.stock 
                    ? 'border-red-500 bg-red-500/5' 
                    : (isDark 
                        ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' 
                        : (formData.hasVariants 
                            ? 'bg-slate-100 border-slate-200 text-slate-400' // Cấm nhập ở theme sáng thì giữ xám
                            : 'bg-white border-water/30 text-slate-800 focus:bg-slate-50'))
                } ${formData.hasVariants ? 'opacity-60 cursor-not-allowed' : ''}`}
                placeholder="0"
                min="0"
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
                Danh mục *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.categoryId 
                    ? 'border-red-500 bg-red-500/5' 
                    : (isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10 dark:text-white dark:bg-card' : 'bg-white border-water/30 text-slate-800 focus:bg-slate-50')
                }`}
              >
                <option value="" className={isDark ? 'bg-card text-white' : 'bg-white text-slate-800'}>Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id} className={isDark ? 'bg-card text-white' : 'bg-white text-slate-800'}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
              Mô tả chi tiết *
            </label>
            <div className={`editor-wrapper rounded-2xl overflow-hidden border ${
              isDark ? 'border-white/10 invert-[0.90] hue-rotate-[165deg] sepia-[0.3] contrast-[1.1] brightness-[0.95]' : 'border-water/20 bg-white'
            }`}>
              <RichTextEditor
                value={formData.description}
                onChange={(content) => {
                  setFormData(prev => ({ ...prev, description: content }));
                  if (errors.description) {
                    setErrors(prev => ({ ...prev, description: '' }));
                  }
                }}
                placeholder="Nhập mô tả chi tiết sản phẩm thủy sinh cao cấp..."
                error={errors.description}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
              Trạng thái kinh doanh
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10 dark:text-white dark:bg-card' : 'bg-white border-water/30 text-slate-800 focus:bg-slate-50'
              }`}
            >
              <option value="ACTIVE" className={isDark ? 'bg-card text-white' : 'bg-white text-slate-800'}>Đang hoạt động</option>
              <option value="INACTIVE" className={isDark ? 'bg-card text-white' : 'bg-white text-slate-800'}>Ngừng kinh doanh</option>
            </select>
          </div>

          {/* Images */}
          <div>
            <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
              Ảnh sản phẩm {!product && '*'}
            </label>
            <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDark ? 'border-white/10 hover:border-emerald-500/50 bg-white/5' : 'border-water/20 hover:border-primary/50 bg-white shadow-sm'
            }`}>
              <Upload className={`mx-auto h-10 w-10 mb-2 ${isDark ? 'text-white/40' : 'text-water/60'}`} />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-input"
              />
              <label htmlFor="image-input" className="cursor-pointer">
                <span className={`font-bold transition-all ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-primary hover:text-primary-hover'}`}>
                  Chọn ảnh
                </span>
                <span className={isDark ? 'text-gray-400' : 'text-slate-500'}> hoặc kéo thả vào đây</span>
              </label>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>PNG, JPG, GIF tối đa 10MB</p>
            </div>
            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}

            {/* Image Preview */}
            {(existingImages.length > 0 || imagePreview.length > 0) && (
              <div className="mt-4 space-y-4">
                {/* ✅ Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Ảnh hiện tại</p>
                    <div className="grid grid-cols-4 gap-3">
                      {existingImages.map((imageUrl, index) => (
                        <div key={`existing-${index}`} className="relative group overflow-hidden rounded-xl aspect-square border border-water/20">
                          <img
                            src={imageUrl}
                            alt={`Existing ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow active:scale-90"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* ✅ New Images */}
                {imagePreview.length > 0 && (
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Ảnh mới thêm</p>
                    <div className="grid grid-cols-4 gap-3">
                      {imagePreview.map((preview, index) => (
                        <div key={`new-${index}`} className="relative overflow-hidden rounded-xl aspect-square border border-emerald-500/20">
                          <img
                            src={preview}
                            alt={`New ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow active:scale-90"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Variants Manager */}
          <div className={`p-4.5 rounded-2xl border transition-all duration-300 ${
            isDark ? 'border-white/5 bg-white/5' : 'border-water/20 bg-white shadow-sm'
          }`}>
            <ProductVariantsManager 
              product={product} 
              onUpdate={handleVariantsUpdate}
            />
          </div>
          {errors.variants && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-500 text-sm font-medium">{errors.variants}</p>
            </div>
          )}

          {/* Buttons */}
          <div className={`flex gap-3 justify-end pt-5 border-t transition-colors duration-300 ${
            isDark ? 'border-white/5' : 'border-water/10'
          }`}>
            <button
              type="button"
              onClick={onCancel}
              className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm ${
                isDark 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-transparent' 
                  : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-500 hover:text-white hover:border-transparent'
              }`}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2.5 text-white rounded-xl transition-all duration-200 font-semibold text-sm active:scale-95 shadow-lg disabled:opacity-50 ${
                isDark 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/10 hover:shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-primary to-water hover:opacity-90 shadow-primary/10 hover:shadow-primary/20'
              }`}
            >
              {isLoading ? 'Đang xử lý...' : product ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;