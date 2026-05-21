import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminUserTable from '../../components/admin/AdminUserTable';
import AdminUserForm from '../../components/admin/AdminUserForm';
import AdminUserFilters from '../../components/admin/AdminUserFilters';
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
  getAllUsersAdmin,
  getUserByIdAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  reset,
  setFilters,
  clearFilters,
  clearCurrentUser
} from '../../redux/slices/adminUserSlice';

const ManageUsers = () => {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const {
    users,
    currentUser,
    isLoading,
    isSuccess,
    isError,
    message,
    filters,
    pagination
  } = useSelector((state) => state.adminUsers);

  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);

  // Load users when filters change
  useEffect(() => {
    const queryParams = {
      page: filters.page,
      limit: filters.limit,
      ...(filters.search && { search: filters.search }),
      ...(filters.role && { role: filters.role }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    };
    dispatch(getAllUsersAdmin(queryParams));
  }, [dispatch, filters]);

  // Handle success/error messages
  useEffect(() => {
    if (isSuccess && message) {
      toast.success(message);
      dispatch(reset());
      if (showForm) {
        setShowForm(false);
        setEditingUserId(null);
        dispatch(clearCurrentUser());
      }
    }
  }, [isSuccess, message, dispatch, showForm]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  // Handle filter changes
  const handleFilterChange = (updates) => {
    dispatch(setFilters(updates));
  };

  const handleSearch = (searchTerm) => {
    dispatch(setFilters({ search: searchTerm, page: 1 }));
  };

  const handlePageChange = (page) => {
    const newPage = Math.max(1, parseInt(page) || 1);
    dispatch(setFilters({ page: newPage }));
  };

  const handleResetFilters = () => {
    dispatch(clearFilters());
  };

  // Handle user actions
  const handleAddUser = () => {
    setEditingUserId(null);
    dispatch(clearCurrentUser());
    setShowForm(true);
  };

  const handleEditUser = (userId) => {
    dispatch(getUserByIdAdmin(userId));
    setEditingUserId(userId);
    setShowForm(true);
  };

  const handleDeleteUser = (userId) => {
    setDeleteUserId(userId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteUserId) {
      dispatch(deleteUserAdmin(deleteUserId));
      setShowConfirm(false);
      setDeleteUserId(null);
    }
  };

  const handleFormSubmit = (formData) => {
    // Only edit existing users
    if (editingUserId) {
      dispatch(updateUserAdmin({ userId: editingUserId, formData }));
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingUserId(null);
    dispatch(clearCurrentUser());
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-transparent p-4 sm:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100/80 dark:bg-blue-900/30 rounded-xl border border-blue-200/50 dark:border-blue-700/30 shadow-inner">
                <Users className="text-blue-600 dark:text-blue-400" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                  Quản lý người dùng
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">Quản lý danh sách người dùng, chỉnh sửa thông tin hoặc xóa tài khoản</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel rounded-3xl p-6 border border-water/30 dark:border-white/10 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Tổng người dùng</div>
            <div className="text-3xl font-black text-slate-800 dark:text-white">{pagination.totalUsers || 0}</div>
            <div className="absolute right-4 bottom-4 text-blue-500/10 dark:text-blue-400/10 group-hover:scale-110 transition-transform duration-300">
              <Users size={64} />
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-6 border border-water/30 dark:border-white/10 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Người dùng hoạt động</div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {users.filter(u => u.isActive).length}
            </div>
            <div className="absolute right-4 bottom-4 text-emerald-500/10 group-hover:scale-110 transition-transform duration-300">
              <Users size={64} />
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-6 border border-water/30 dark:border-white/10 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Quản trị viên</div>
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="absolute right-4 bottom-4 text-purple-500/10 group-hover:scale-110 transition-transform duration-300">
              <Users size={64} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <AdminUserFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleResetFilters}
        />

        {/* Users Table */}
        <div className="glass-panel rounded-3xl shadow-xl overflow-hidden mb-6 border border-water/30 dark:border-white/10">
          <AdminUserTable
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            isLoading={isLoading}
          />

          {/* Pagination inside the card container */}
          {pagination.totalPages >= 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-5 bg-transparent border-t border-water/20 dark:border-white/10">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Hiển thị <span className="font-semibold text-slate-800 dark:text-white">{users.length}</span> trong tổng số{' '}
                <span className="font-semibold text-slate-800 dark:text-white">{pagination.totalUsers}</span> người dùng
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all ${
                    pagination.currentPage === 1
                      ? 'text-slate-400 dark:text-slate-600 border-slate-200/50 dark:border-slate-800 cursor-not-allowed'
                      : 'text-slate-700 dark:text-slate-200 border-water/30 dark:border-white/10 hover:bg-water/10 dark:hover:bg-white/5 active:scale-95'
                  }`}
                >
                  Trước
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage > pagination.totalPages - 3) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    const isActive = pagination.currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-primary to-water text-white shadow-md shadow-primary/20'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-water/10 dark:hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all ${
                    pagination.currentPage === pagination.totalPages
                      ? 'text-slate-400 dark:text-slate-600 border-slate-200/50 dark:border-slate-800 cursor-not-allowed'
                      : 'text-slate-700 dark:text-slate-200 border-water/30 dark:border-white/10 hover:bg-water/10 dark:hover:bg-white/5 active:scale-95'
                  }`}
                >
                  Tiếp
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Form Modal */}
        {showForm && (
          <AdminUserForm
            user={currentUser}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showConfirm}
          title="Xác nhận xóa người dùng"
          message="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
          isDangerous={true}
        />
      </div>
    </AdminLayout>
  );
};

export default ManageUsers;
