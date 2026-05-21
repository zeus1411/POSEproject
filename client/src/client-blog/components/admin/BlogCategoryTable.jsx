import React from 'react';
import { Pencil, Trash2, FolderOpen, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../../client-eco/context/ThemeContext';

const BlogCategoryTable = ({ categories, onEdit, onDelete, onToggleStatus, isLoading }) => {
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          isDark ? 'border-emerald-400' : 'border-primary'
        }`}></div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-16">
        <FolderOpen className={`mx-auto h-12 w-12 ${isDark ? 'text-white/20' : 'text-water/40'}`} />
        <h3 className={`mt-4 text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Không có danh mục bài viết nào
        </h3>
        <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          Bắt đầu bằng cách tạo danh mục bài viết mới
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="min-w-full divide-y divide-transparent">
        <thead className={`transition-colors duration-300 ${
          isDark ? 'bg-white/5 border-b border-white/10' : 'bg-water/10 border-b border-water/30'
        }`}>
          <tr>
            <th className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${
              isDark ? 'text-emerald-400' : 'text-primary'
            }`}>
              Tên danh mục
            </th>
            <th className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${
              isDark ? 'text-emerald-400' : 'text-primary'
            }`}>
              Slug
            </th>
            <th className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${
              isDark ? 'text-emerald-400' : 'text-primary'
            }`}>
              Mô tả
            </th>
            <th className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${
              isDark ? 'text-emerald-400' : 'text-primary'
            }`}>
              Số bài viết
            </th>
            <th className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${
              isDark ? 'text-emerald-400' : 'text-primary'
            }`}>
              Trạng thái
            </th>
            <th className={`px-6 py-4 text-right text-xs font-black uppercase tracking-wider ${
              isDark ? 'text-emerald-400' : 'text-primary'
            }`}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y transition-colors duration-300 ${
          isDark ? 'divide-white/5 bg-transparent' : 'divide-water/10 bg-transparent'
        }`}>
          {categories.map((category) => (
            <tr 
              key={category._id} 
              className={`transition-colors duration-200 ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-water/5'
              }`}
            >
              <td className="px-6 py-4.5 whitespace-nowrap">
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {category.name}
                </div>
              </td>
              <td className="px-6 py-4.5 whitespace-nowrap">
                <div className={`text-sm font-mono ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  {category.slug}
                </div>
              </td>
              <td className="px-6 py-4.5">
                <div className={`text-sm max-w-xs truncate ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  {category.description || '-'}
                </div>
              </td>
              <td className="px-6 py-4.5 whitespace-nowrap">
                <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {category.blogCount || 0}
                </div>
              </td>
              <td className="px-6 py-4.5 whitespace-nowrap">
                <span
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border transition-all ${
                    category.status === 'ACTIVE'
                      ? (isDark 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                      : (isDark 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                          : 'bg-rose-50 text-rose-700 border-rose-200')
                  }`}
                >
                  {category.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu hóa'}
                </span>
              </td>
              <td className="px-6 py-4.5 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => onToggleStatus(category._id, category.status)}
                    className={`p-2 rounded-xl transition ${
                      category.status === 'ACTIVE'
                        ? (isDark 
                            ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10' 
                            : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50')
                        : (isDark 
                            ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                            : 'text-gray-500 hover:text-gray-800 hover:bg-water/10')
                    }`}
                    title={category.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  >
                    {category.status === 'ACTIVE' ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => onEdit(category._id)}
                    className={`p-2 rounded-xl transition ${
                      isDark 
                        ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10' 
                        : 'text-primary hover:text-primary-hover hover:bg-water/10'
                    }`}
                    title="Chỉnh sửa"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(category._id)}
                    className={`p-2 rounded-xl transition ${
                      isDark 
                        ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10' 
                        : 'text-rose-600 hover:text-rose-800 hover:bg-rose-50'
                    }`}
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlogCategoryTable;