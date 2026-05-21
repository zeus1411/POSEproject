import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../../client-eco/context/ThemeContext';

const BlogCategoryForm = ({ category, onSubmit, onCancel, isLoading }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        isActive: true
      });
    }
  }, [category]);

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'name') {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value)
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 ${
        isDark ? 'bg-[#062323] border border-white/10 text-white' : 'bg-[#FFFDF0] border border-water/45 text-foreground'
      }`}>
        <div className={`sticky top-0 px-6 py-4.5 flex justify-between items-center border-b transition-colors duration-300 ${
          isDark ? 'bg-[#062323] border-white/10' : 'bg-[#FFFDF0] border-water/20'
        }`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {category ? 'Chỉnh sửa danh mục bài viết' : 'Thêm danh mục bài viết'}
          </h2>
          <button
            onClick={onCancel}
            className={`transition p-1.5 rounded-xl ${
              isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-rose-500 hover:bg-water/10'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className={`block text-xs font-bold pl-1 mb-2 ${
              isDark ? 'text-gray-300' : 'text-slate-700'
            }`}>
              Tên danh mục <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2.5 border transition-all ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent' 
                  : 'bg-white border-water/30 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent'
              }`}
              placeholder="Nhập tên danh mục bài viết"
            />
          </div>

          <div>
            <label htmlFor="slug" className={`block text-xs font-bold pl-1 mb-2 ${
              isDark ? 'text-gray-300' : 'text-slate-700'
            }`}>
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border transition-all ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent' 
                  : 'bg-white border-water/30 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent'
              }`}
              placeholder="vi-du-slug"
            />
          </div>

          <div>
            <label htmlFor="description" className={`block text-xs font-bold pl-1 mb-2 ${
              isDark ? 'text-gray-300' : 'text-slate-700'
            }`}>
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2.5 border transition-all ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent' 
                  : 'bg-white border-water/30 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent'
              }`}
              placeholder="Nhập mô tả danh mục bài viết"
            />
          </div>

          <div className="flex items-center pl-1">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4.5 w-4.5 rounded accent-emerald-500 cursor-pointer"
            />
            <label htmlFor="isActive" className={`ml-3 block text-sm font-semibold cursor-pointer ${
              isDark ? 'text-gray-300' : 'text-slate-700'
            }`}>
              Kích hoạt danh mục bài viết này
            </label>
          </div>

          <div className={`flex justify-end gap-3 pt-6 border-t ${
            isDark ? 'border-white/10' : 'border-water/20'
          }`}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className={`px-5 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                isDark 
                  ? 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5' 
                  : 'border-water/30 text-slate-600 hover:bg-water/10'
              }`}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
                isDark 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/20' 
                  : 'bg-gradient-to-r from-primary to-water hover:from-primary/90 hover:to-water/90 shadow-water/20'
              }`}
            >
              {isLoading ? 'Đang lưu...' : category ? '💾 Cập nhật danh mục' : '✨ Tạo danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogCategoryForm;