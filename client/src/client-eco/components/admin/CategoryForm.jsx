import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import IconPicker from './IconPicker';
import { useTheme } from '../../context/ThemeContext';

const CategoryForm = ({ category, onSubmit, onCancel, isLoading }) => {
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📦', // Icon mặc định
    isActive: true // Mặc định kích hoạt
  });

  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || '📦',
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-300">
      <div className={`glass-panel solid-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl transition-all duration-300 ${
        isDark ? 'border-white/10 text-white shadow-black/40' : 'border-water/40 text-slate-800 shadow-slate-900/10'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 py-4 flex justify-between items-center border-b transition-colors duration-300 ${
          isDark ? 'border-white/5 bg-[#051c1c]/95' : 'border-water/10 bg-[#FFFDF0]/95'
        }`}>
          <h2 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {category ? '✏️ Chỉnh sửa danh mục' : '✨ Thêm danh mục mới'}
          </h2>
          <button
            onClick={onCancel}
            className={`transition-colors duration-200 ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
              Tên danh mục *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-water/5 border-water/20 text-slate-800 focus:bg-water/10'
              }`}
              placeholder="Nhập tên danh mục"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-water/5 border-water/20 text-slate-800 focus:bg-water/10'
              }`}
              placeholder="Nhập mô tả danh mục"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
              Icon danh mục
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                className={`w-20 h-20 border-2 rounded-2xl hover:scale-105 transition-all flex items-center justify-center text-4xl shadow-md ${
                  isDark 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                    : 'bg-water/5 border-water/20 hover:bg-water/10'
                }`}
              >
                {formData.icon}
              </button>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Click để chọn icon hiển thị cho danh mục
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                  Icon sẽ hiển thị trên trang Shop
                </p>
              </div>
            </div>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className={`h-5 w-5 rounded transition-colors duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-0 ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-emerald-500' 
                  : 'bg-water/5 border-water/20 text-primary'
              }`}
            />
            <label htmlFor="isActive" className={`text-sm font-semibold select-none cursor-pointer ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Kích hoạt danh mục
            </label>
          </div>

          {/* Actions */}
          <div className={`flex justify-end gap-3 pt-5 border-t transition-colors duration-300 ${
            isDark ? 'border-white/5' : 'border-water/10'
          }`}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                isDark 
                  ? 'border-white/10 text-gray-300 hover:bg-white/10 hover:text-white' 
                  : 'border-water/20 text-slate-700 hover:bg-water/10 hover:text-slate-900'
              }`}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2.5 text-white rounded-xl transition-all duration-200 font-semibold text-sm active:scale-95 shadow-lg disabled:opacity-50 flex items-center gap-2 ${
                isDark 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/10 hover:shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-primary to-water hover:opacity-90 shadow-primary/10 hover:shadow-primary/20'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang lưu...
                </>
              ) : (
                category ? 'Cập nhật' : 'Tạo mới'
              )}
            </button>
          </div>
        </form>

        {/* Icon Picker Modal */}
        {showIconPicker && (
          <IconPicker
            selectedIcon={formData.icon}
            onSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
            onClose={() => setShowIconPicker(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryForm;
