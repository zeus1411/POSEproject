import React from 'react';
import { Pencil, Trash2, Package, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const CategoryTable = ({ categories, onEdit, onDelete, onToggleStatus, isLoading }) => {
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
        <h3 className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Không có danh mục nào</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Bắt đầu bằng cách tạo danh mục mới</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-water/10 dark:bg-white/5 border-b border-water/20 dark:border-white/10">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tên danh mục
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Slug
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mô tả
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Số sản phẩm
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-water/10 dark:divide-white/5">
          {categories.map((category) => (
            <tr key={category._id} className="hover:bg-water/5 dark:hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div 
                    className="w-12 h-12 bg-gradient-to-br from-water/10 to-primary/10 border border-water/30 dark:from-white/5 dark:to-white/10 dark:border-white/20 rounded-xl flex items-center justify-center text-2xl mr-3 hover:scale-110 transition-transform cursor-help"
                    title={`Icon: ${category.icon || '📦'}`}
                  >
                    {category.icon || '📦'}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{category.name}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-mono text-slate-500 dark:text-slate-400">{category.slug}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                  {category.description || '-'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{category.productCount || 0}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    category.isActive
                      ? 'bg-green-100/80 dark:bg-green-950/50 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/30'
                      : 'bg-red-100/80 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/30'
                  }`}
                >
                  {category.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onToggleStatus(category._id, !category.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      category.isActive
                        ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40'
                        : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                    title={category.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  >
                    {category.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => onEdit(category._id)}
                    className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(category._id)}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
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

export default CategoryTable;

