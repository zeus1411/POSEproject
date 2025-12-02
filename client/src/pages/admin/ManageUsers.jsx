import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminUserTable from '../../components/admin/AdminUserTable';
import AdminUserForm from '../../components/admin/AdminUserForm';
import AdminUserFilters from '../../components/admin/AdminUserFilters';
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Users } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
                <p className="text-gray-600 mt-1">Quản lý danh sách người dùng, chỉnh sửa thông tin hoặc xóa tài khoản</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">Tổng người dùng</div>
            <div className="text-3xl font-bold text-gray-900">{pagination.totalUsers || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">Người dùng hoạt động</div>
            <div className="text-3xl font-bold text-green-600">
              {users.filter(u => u.isActive).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">Quản trị viên</div>
            <div className="text-3xl font-bold text-purple-600">
              {users.filter(u => u.role === 'admin').length}
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
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <AdminUserTable
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination */}
        {pagination.totalPages >= 1 && (
          <div className="flex justify-between items-center px-6 py-4 bg-white border-t border-gray-200 rounded-b-lg shadow-sm">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-medium">{users.length}</span> trong tổng số{' '}
              <span className="font-medium">{pagination.totalUsers}</span> người dùng
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 border rounded-md text-sm ${
                  pagination.currentPage === 1
                    ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Trước
              </button>
              <div className="flex items-center gap-1">
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

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-md text-sm ${
                        pagination.currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
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
                className={`px-3 py-1 border rounded-md text-sm ${
                  pagination.currentPage === pagination.totalPages
                    ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Tiếp
              </button>
            </div>
          </div>
        )}

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
