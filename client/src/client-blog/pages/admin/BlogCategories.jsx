import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Plus, FolderTree } from 'lucide-react';

import AdminLayout from '../../../client-eco/components/admin/AdminLayout';
import ConfirmDialog from '../../../client-eco/components/common/ConfirmDialog';
import BlogCategoryTable from '../../components/admin/BlogCategoryTable';
import BlogCategoryForm from '../../components/admin/BlogCategoryForm';
import { useTheme } from '../../../client-eco/context/ThemeContext';

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
  const { isDark } = useTheme();
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    blogCategories,
    totalPages,
    total,
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
    dispatch(
      getBlogCategories({
        page,
        limit,
        includeInactive: true
      })
    );
  }, [dispatch, page]);

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
      <div className="min-h-screen bg-transparent p-4 sm:p-6 md:p-8 relative z-10">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className={`text-3xl font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                Blog Categories
              </h1>

              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isDark 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-water/10 text-primary border border-water/20 font-bold'
              }`}>
                {blogCategories?.length || 0} danh mục
              </span>
            </div>

            <p className={`font-medium text-sm ${
              isDark ? 'text-gray-400' : 'text-slate-600'
            }`}>
              Quản lý danh mục dùng để phân loại nội dung bài viết thủy sinh.
            </p>
          </div>

          <button
            onClick={handleAddCategory}
            className={`
              ${isDark 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/20' 
                : 'bg-gradient-to-r from-primary to-water hover:from-primary/90 hover:to-water/90 shadow-water/20'}
              text-white
              px-6 py-3
              rounded-2xl
              font-bold
              shadow-lg
              hover:scale-[1.02]
              active:scale-[0.98]
              transition-all
              flex items-center gap-2
            `}
          >
            <Plus size={18} />
            Thêm danh mục
          </button>
        </div>

        {/* TABLE */}
        <div className="glass-panel rounded-[2rem] overflow-hidden shadow-2xl">
          <BlogCategoryTable
            categories={blogCategories}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onToggleStatus={handleToggleCategoryStatus}
            isLoading={isLoading}
          />
        </div>

        {/* FORM */}
        {showForm && (
          <BlogCategoryForm
            category={currentBlogCategory}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        )}

        <ConfirmDialog
          isOpen={showConfirm}
          title="Xác nhận xóa danh mục"
          message="Bạn có chắc muốn xóa danh mục này? Hành động này không thể hoàn tác."
          confirmText="Xóa danh mục"
          cancelText="Hủy bỏ"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
          isDangerous
        />
      </div>
    </AdminLayout>
  );
};

export default BlogCategories;