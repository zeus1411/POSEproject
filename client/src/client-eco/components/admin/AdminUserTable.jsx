import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const AdminUserTable = ({ users, onEdit, onDelete, onToggleStatus, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Không có người dùng nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tên người dùng</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Họ tên</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vai trò</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ngày tạo</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                      {user.username?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <p className="font-medium text-gray-900">{user.username}</p>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{user.fullName || '-'}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit && onEdit(user._id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(user._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
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
