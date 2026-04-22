import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Plus, Tag } from 'lucide-react';

import AdminLayout from '../../../client-eco/components/admin/AdminLayout';
import ConfirmDialog from '../../../client-eco/components/common/ConfirmDialog';
import BlogTagTable from '../../components/admin/BlogTagTable';
import BlogTagForm from '../../components/admin/BlogTagForm';

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
      <div className="min-h-screen bg-[#f8f9ff] p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black tracking-tight text-[#1e293b]">
                Blog Tags
              </h1>

              <span className="bg-[#4f46e5]/10 text-[#4f46e5] px-3 py-1 rounded-full text-sm font-bold">
                {blogTags?.length || 0} tags
              </span>
            </div>

            <p className="text-slate-500 font-medium">
              Quản lý hệ thống tag dùng để gắn nhãn bài viết.
            </p>
          </div>

          <button
            onClick={handleAddTag}
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
            <Tag size={18} />
            Thêm tag
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
          <BlogTagTable
            tags={blogTags}
            onEdit={handleEditTag}
            onDelete={handleDeleteTag}
            onToggleStatus={handleToggleTagStatus}
            isLoading={isLoading}
          />
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
          message="Bạn có chắc muốn xóa tag này?"
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
          isDangerous
        />
      </div>
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Trang {page} / {totalPages || 1}
        </p>

        <div className="flex gap-2">

          <button
            disabled={page===1}
            onClick={() => setPage(page-1)}
            className={`
              px-4 py-2 rounded-lg border
              ${
                page===1
                ? 'bg-slate-100 text-slate-400'
                : 'bg-white hover:bg-slate-50'
              }
            `}
          >
            Prev
          </button>

          <button
            disabled={page===totalPages}
            onClick={() => setPage(page+1)}
            className={`
              px-4 py-2 rounded-lg border
              ${
                page===totalPages
                ? 'bg-slate-100 text-slate-400'
                : 'bg-white hover:bg-slate-50'
              }
            `}
          >
            Next
          </button>

        </div>
      </div>
    </AdminLayout>
  );
};

export default BlogTags;