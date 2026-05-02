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
  const [page,setPage]=useState(1);
  const limit=10;

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
        includeInactive:true
      })
    );
  }, [dispatch,page]);

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
      <div className="min-h-screen bg-[#f8f9ff] p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black tracking-tight text-[#1e293b]">
                Blog Categories
              </h1>

              <span className="bg-[#4f46e5]/10 text-[#4f46e5] px-3 py-1 rounded-full text-sm font-bold">
                {blogCategories?.length || 0} danh mục
              </span>
            </div>

            <p className="text-slate-500 font-medium">
              Quản lý danh mục dùng để phân loại nội dung bài viết.
            </p>
          </div>

          <button
            onClick={handleAddCategory}
            className="
              bg-[#4f46e5]
              text-white
              px-5 py-3
              rounded-xl
              font-bold
              shadow-md
              hover:shadow-lg
              hover:scale-[1.02]
              transition-all
              flex items-center gap-2
            "
          >
            <Plus size={18} />
            Thêm danh mục
          </button>
        </div>

        {/* TABLE */}
        <div
          className="
            bg-white
            rounded-2xl
            shadow-[0_8px_32px_rgba(11,28,48,0.04)]
            overflow-hidden
            border border-slate-100
          "
        >
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
          message="Bạn có chắc muốn xóa danh mục này?"
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
          isDangerous
        />
      </div>
    </AdminLayout>
  );
};

export default BlogCategories;