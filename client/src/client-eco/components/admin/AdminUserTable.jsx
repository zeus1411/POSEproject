import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminUserTable = ({ users, onEdit, onDelete, onToggleStatus, isLoading }) => {
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400 text-lg font-semibold">Không có người dùng nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-water/10 dark:bg-white/5 border-b border-water/20 dark:border-white/10">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tên người dùng</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Họ tên</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vai trò</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ngày tạo</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-water/10 dark:divide-white/5">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-water/5 dark:hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border border-water/30 dark:border-white/10"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold border border-water/20 dark:border-white/10 shadow-inner">
                      {user.username?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{user.username}</p>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-300">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-300">{user.fullName || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  user.role === 'admin'
                    ? 'bg-purple-100/80 text-purple-800 border-purple-200/50 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/30'
                    : 'bg-blue-100/80 text-blue-800 border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/30'
                }`}>
                  {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-300">
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit && onEdit(user._id)}
                    className="p-2 text-primary hover:bg-water/10 dark:text-water dark:hover:bg-white/5 rounded-xl transition-all"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(user._id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
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

export default AdminUserTable;
