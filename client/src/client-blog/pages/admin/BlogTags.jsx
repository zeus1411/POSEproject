import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Plus, Tag } from 'lucide-react';

import AdminLayout from '../../../client-eco/components/admin/AdminLayout';
import ConfirmDialog from '../../../client-eco/components/common/ConfirmDialog';
import BlogTagTable from '../../components/admin/BlogTagTable';
import BlogTagForm from '../../components/admin/BlogTagForm';
import { useTheme } from '../../../client-eco/context/ThemeContext';

import {
  getBlogTags,
  getBlogTagById,
  createBlogTag,
  updateBlogTag,
  deleteBlogTag,
  updateBlogTagStatus,
  reset,
  clearCurrentBlogTag
} from '../../redux/slices/blogTagSlice';

const BlogTags = () => {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    blogTags,
    totalPages,
    currentBlogTag,
    isLoading,
    isSuccess,
    isError,
    message
  } = useSelector((state) => state.blogTags);

  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTagId, setDeleteTagId] = useState(null);
  const [editingTag, setEditingTag] = useState(null);

  // Load tags
  useEffect(() => {
    dispatch(
      getBlogTags({
        page,
        limit,
        includeInactive: true
      })
    );
  }, [dispatch, page]);

  // Success
  useEffect(() => {
    if (isSuccess && message) {
      toast.success(message);
      dispatch(reset());

      if (showForm) {
        setShowForm(false);
        setEditingTag(null);
      }

      dispatch(getBlogTags(true));
    }
  }, [isSuccess, message, dispatch, showForm]);

  // Error
  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const handleAddTag = () => {
    setEditingTag(null);
    dispatch(clearCurrentBlogTag());
    setShowForm(true);
  };

  const handleEditTag = async (tagId) => {
    await dispatch(getBlogTagById(tagId));
    setEditingTag(tagId);
    setShowForm(true);
  };
  
  const handleDeleteTag = (tagId) => {
    setDeleteTagId(tagId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTagId) {
      dispatch(deleteBlogTag(deleteTagId));
      setShowConfirm(false);
      setDeleteTagId(null);
    }
  };

  const handleFormSubmit = (formData) => {
    if (editingTag) {
      dispatch(
        updateBlogTag({
          tagId: editingTag,
          tagData: formData
        })
      );
    } else {
      dispatch(createBlogTag(formData));
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTag(null);
    dispatch(clearCurrentBlogTag());
  };

  const handleToggleTagStatus = async (tagId, newStatus) => {
    try {
      await dispatch(
        updateBlogTagStatus({
          tagId,
          isActive: newStatus
        })
      ).unwrap();

      dispatch(getBlogTags(true));
    } catch (error) {
      console.error('Error toggling blog tag status:', error);
      toast.error('Có lỗi khi cập nhật trạng thái tag');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-transparent p-4 sm:p-6 md:p-8 relative z-10 flex flex-col justify-between">
        <div>
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className={`text-3xl font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>
                  Thẻ blog
                </h1>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isDark 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-water/10 text-primary border border-water/20 font-bold'
                }`}>
                  {blogTags?.length || 0} tags
                </span>
              </div>

              <p className={`font-medium text-sm ${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}>
                Quản lý hệ thống tag dùng để gắn nhãn bài viết thủy sinh.
              </p>
            </div>

            <button
              onClick={handleAddTag}
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
              Thêm tag
            </button>
          </div>

          {/* TABLE */}
          <div className="glass-panel rounded-[2rem] overflow-hidden shadow-2xl mb-6">
            <BlogTagTable
              tags={blogTags}
              onEdit={handleEditTag}
              onDelete={handleDeleteTag}
              onToggleStatus={handleToggleTagStatus}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* PAGINATION FOOTER */}
        <div className={`mt-auto px-6 py-4 flex items-center justify-between rounded-2xl border transition-all ${
          isDark 
            ? 'bg-[#062323]/40 border-white/5 text-gray-300' 
            : 'bg-[#FFFDF0]/60 border-water/20 text-slate-700'
        }`}>
          <p className="text-sm font-semibold">
            Trang {page} / {totalPages || 1}
          </p>

          <div className="flex gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold transition-all border
                ${isDark
                  ? 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent'
                  : 'bg-white text-gray-700 border-water/30 hover:bg-water/10 disabled:opacity-40 disabled:hover:bg-transparent'
                }
              `}
            >
              Trang trước
            </button>

            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold transition-all border
                ${isDark
                  ? 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent'
                  : 'bg-white text-gray-700 border-water/30 hover:bg-water/10 disabled:opacity-40 disabled:hover:bg-transparent'
                }
              `}
            >
              Trang sau
            </button>
          </div>
        </div>

        {showForm && (
          <BlogTagForm
            tag={currentBlogTag}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        )}

        <ConfirmDialog
          isOpen={showConfirm}
          title="Xác nhận xóa tag"
          message="Bạn có chắc muốn xóa tag này? Hành động này không thể hoàn tác."
          confirmText="Xóa tag"
          cancelText="Hủy bỏ"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
          isDangerous
        />
      </div>
    </AdminLayout>
  );
};

export default BlogTags;
