import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminUserForm = ({ user, onSubmit, onCancel, isLoading }) => {
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    role: 'user',
    gender: '',
    dateOfBirth: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        role: user.role || 'user',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên người dùng là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Tên người dùng không được vượt quá 30 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (formData.phone && !/^(0[3|5|7|8|9])+([0-9]{8})\b/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    // ✅ Nếu role thay đổi so với ban đầu, kiểm tra các trường bắt buộc
    if (user && formData.role !== user.role) {
      if (!formData.fullName || !formData.fullName.trim()) {
        newErrors.fullName = 'Họ và tên là bắt buộc khi thay đổi vai trò';
      }
      if (!formData.phone || !formData.phone.trim()) {
        newErrors.phone = 'Số điện thoại là bắt buộc khi thay đổi vai trò';
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Ngày sinh là bắt buộc khi thay đổi vai trò';
      }
      if (!formData.gender || formData.gender === '') {
        newErrors.gender = 'Giới tính là bắt buộc khi thay đổi vai trò';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-300">
      <div className={`glass-panel solid-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl transition-all duration-300 ${
        isDark ? 'border-white/10 text-white shadow-black/40' : 'border-water/40 text-slate-800 shadow-slate-900/10'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 flex justify-between items-center border-b transition-colors duration-300 ${
          isDark ? 'border-white/5 bg-[#051c1c]/95' : 'border-water/10 bg-[#FFFDF0]/95'
        }`}>
          <h2 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {user ? '✏️ Chỉnh sửa người dùng' : '✨ Thêm người dùng mới'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
                Tên người dùng *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="username123"
                className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.username
                    ? 'border-red-500 bg-red-500/5'
                    : (isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-water/5 border-water/20 text-slate-800 focus:bg-water/10')
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
                Email
              </label>
              <div className={`w-full px-4 py-2.5 text-sm border rounded-xl transition-all duration-200 opacity-60 ${
                isDark ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-water/5 border-water/20 text-slate-600'
              }`}>
                {formData.email || '(không có email)'}
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Email không thể thay đổi</p>
            </div>

            {/* Full Name */}
            <div>
              <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
                Họ tên
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.fullName
                    ? 'border-red-500 bg-red-500/5'
                    : (isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-water/5 border-water/20 text-slate-800 focus:bg-water/10')
                }`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912345678"
                className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.phone
                    ? 'border-red-500 bg-red-500/5'
                    : (isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-water/5 border-water/20 text-slate-800 focus:bg-water/10')
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
                Ngày sinh {user && formData.role !== user.role && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.dateOfBirth
                    ? 'border-red-500 bg-red-500/5'
                    : (isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10 dark:[color-scheme:dark]' : 'bg-water/5 border-water/20 text-slate-800 focus:bg-water/10')
                }`}
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
                Giới tính {user && formData.role !== user.role && <span className="text-red-500">*</span>}
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.gender
                    ? 'border-red-500 bg-red-500/5'
                    : (isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10 dark:text-white dark:bg-card' : 'bg-white border-water/20 text-slate-800 focus:bg-water/10')
                }`}
              >
                <option value="" className={isDark ? 'bg-card text-white' : 'bg-white text-slate-800'}>-- Chọn giới tính --</option>
                <option value="male" className={isDark ? 'bg-card text-white' : 'bg-white text-slate-800'}>Nam</option>
                <option value="female" className={isDark ? 'bg-card text-white' : 'bg-white text-slate-800'}>Nữ</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-emerald-400' : 'text-primary'}`}>
                Vai trò *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10 dark:text-white dark:bg-card' : 'bg-white border-water/20 text-slate-800 focus:bg-water/10'
                }`}
              >
                <option value="user" className={isDark ? 'bg-card text-white' : 'bg-white text-slate-800'}>Người dùng</option>
                <option value="admin" className={isDark ? 'bg-card text-white' : 'bg-white text-slate-800'}>Quản trị viên</option>
              </select>
              {user && formData.role !== user.role && (
                <p className="text-amber-500 text-xs mt-2.5 flex items-start gap-1">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Để thay đổi vai trò, vui lòng nhập đầy đủ: Họ tên, SĐT, Ngày sinh, Giới tính</span>
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className={`flex gap-3 pt-6 border-t transition-colors duration-300 ${
            isDark ? 'border-white/5' : 'border-water/10'
          }`}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className={`flex-1 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
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
              className={`flex-1 px-5 py-2.5 text-white rounded-xl transition-all duration-200 font-semibold text-sm active:scale-95 shadow-lg disabled:opacity-50 ${
                isDark 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/10 hover:shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-primary to-water hover:opacity-90 shadow-primary/10 hover:shadow-primary/20'
              }`}
            >
              {isLoading ? 'Đang lưu...' : (user ? 'Cập nhật' : 'Tạo người dùng')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserForm;
