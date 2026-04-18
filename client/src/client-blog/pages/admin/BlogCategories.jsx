import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Plus, FolderTree } from 'lucide-react';

import AdminLayout from '../../../client-eco/components/admin/AdminLayout';
import ConfirmDialog from '../../../client-eco/components/common/ConfirmDialog';
import BlogCategoryTable from '../../components/admin/BlogCategoryTable';
import BlogCategoryForm from '../../components/admin/BlogCategoryForm';

import {
  getBlogCategories,
  getBlogCategoryById,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  updateBlogCategoryStatus,
  reset,
  clearCurrentBlogCategory
} from '../../redux/slices/blogCategorySlice';

const BlogCategories = () => {
  const dispatch = useDispatch();

  const {
    blogCategories,
    currentBlogCategory,
    isLoading,
    isSuccess,
    isError,
    message
  } = useSelector((state) => state.blogCategories);

  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Load blog categories on mount
  useEffect(() => {
    dispatch(getBlogCategories(true));
  }, [dispatch]);

  // Handle success
  useEffect(() => {
    if (isSuccess && message) {
      toast.success(message);
      dispatch(reset());

      if (showForm) {
        setShowForm(false);
        setEditingCategory(null);
      }

      dispatch(getBlogCategories(true));
    }
  }, [isSuccess, message, dispatch, showForm]);

  // Handle error
  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    dispatch(clearCurrentBlogCategory());
    setShowForm(true);
  };

  const handleEditCategory = async (categoryId) => {
  try {
    await dispatch(getBlogCategoryById(categoryId)).unwrap();
    setEditingCategory(categoryId);
    setShowForm(true);
  } catch (err) {
    toast.error('Không lấy được dữ liệu danh mục');
  }
};

  const handleDeleteCategory = (categoryId) => {
    setDeleteCategoryId(categoryId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteCategoryId) {
      dispatch(deleteBlogCategory(deleteCategoryId));
      setShowConfirm(false);
      setDeleteCategoryId(null);
    }
  };

  const handleFormSubmit = (formData) => {
    if (editingCategory) {
      dispatch(
        updateBlogCategory({
          categoryId: editingCategory,
          categoryData: formData
        })
      );
    } else {
      dispatch(createBlogCategory(formData));
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    dispatch(clearCurrentBlogCategory());
  };

  const handleToggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      const newStatus =
        currentStatus === 'ACTIVE'
          ? 'INACTIVE'
          : 'ACTIVE';

      await dispatch(
        updateBlogCategoryStatus({
          categoryId,
          status: newStatus
        })
      ).unwrap();

    } catch (error) {
      console.error(error);
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý danh mục bài viết
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý danh mục dùng cho các bài blog thủy sinh
            </p>
          </div>

          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus size={20} />
            Thêm danh mục bài viết
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <BlogCategoryTable
            categories={blogCategories}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onToggleStatus={handleToggleCategoryStatus}
            isLoading={isLoading}
          />
        </div>

        {/* Form Modal */}
        {showForm && (
          <BlogCategoryForm
            category={currentBlogCategory}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        )}

        {/* Confirm Delete */}
        <ConfirmDialog
          isOpen={showConfirm}
          title="Xác nhận xóa danh mục bài viết"
          message="Bạn có chắc chắn muốn xóa danh mục bài viết này? Hành động này không thể hoàn tác."
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

export default BlogCategories;