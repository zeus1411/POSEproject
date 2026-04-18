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

  const {
    blogTags,
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
    dispatch(getBlogTags(true));
  }, [dispatch]);

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
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý Tags bài viết
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý các tag cho blog thủy sinh
            </p>
          </div>

          <button
            onClick={handleAddTag}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Tag size={20} />
            Thêm Tag
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <BlogTagTable
            tags={blogTags}
            onEdit={handleEditTag}
            onDelete={handleDeleteTag}
            onToggleStatus={handleToggleTagStatus}
            isLoading={isLoading}
          />
        </div>

        {/* Form */}
        {showForm && (
          <BlogTagForm
            tag={currentBlogTag}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        )}

        {/* Confirm Delete */}
        <ConfirmDialog
          isOpen={showConfirm}
          title="Xác nhận xóa tag"
          message="Bạn có chắc muốn xóa tag này? Không thể hoàn tác."
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

export default BlogTags;