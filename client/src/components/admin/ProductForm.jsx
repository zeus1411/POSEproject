import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useSelector } from 'react-redux';
import ProductVariantsManager from './ProductVariantsManager';

const ProductForm = ({ product, categories, onSubmit, onCancel, isLoading }) => {
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
    if (!formData.description.trim()) newErrors.description = 'Mô tả sản phẩm là bắt buộc';
    
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto pt-8 pb-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {product ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập tên sản phẩm"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* SKU and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.sku ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập SKU"
              />
              {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
            </div>

            {!formData.hasVariants && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá (₫) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            )}
          </div>

          {/* Stock and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho *
                {formData.hasVariants && (
                  <span className="ml-2 text-xs text-blue-600">(Tự động tính từ variants)</span>
                )}
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                disabled={formData.hasVariants}
                className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                } ${formData.hasVariants ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="0"
                min="0"
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập mô tả sản phẩm"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Ngừng kinh doanh</option>
            </select>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh sản phẩm {!product && '*'}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-input"
              />
              <label htmlFor="image-input" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  Chọn ảnh
                </span>
                <span className="text-gray-500"> hoặc kéo thả</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF tối đa 10MB</p>
            </div>
            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}

            {/* Image Preview */}
            {(existingImages.length > 0 || imagePreview.length > 0) && (
              <div className="mt-4">
                {/* ✅ Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Ảnh hiện tại</p>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      {existingImages.map((imageUrl, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Existing ${index}`}
                            className="w-full h-24 object-cover rounded border-2 border-blue-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* ✅ New Images */}
                {imagePreview.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Ảnh mới</p>
                    <div className="grid grid-cols-4 gap-4">
                      {imagePreview.map((preview, index) => (
                        <div key={`new-${index}`} className="relative">
                          <img
                            src={preview}
                            alt={`New ${index}`}
                            className="w-full h-24 object-cover rounded border-2 border-green-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X size={16} />
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
          <ProductVariantsManager 
            product={product} 
            onUpdate={handleVariantsUpdate}
          />
          {errors.variants && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{errors.variants}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Đang xử lý...' : product ? 'Cập nhật' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
