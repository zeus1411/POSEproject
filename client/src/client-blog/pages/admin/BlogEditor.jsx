import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

import AdminLayout from '../../../client-eco/components/admin/AdminLayout';
import BlogForm from '../../components/admin/BlogForm';

import {
  getBlogById,
  createBlog,
  updateBlog,
  reset
} from '../../redux/slices/blogSlice';

import { getBlogCategories } from '../../redux/slices/blogCategorySlice';
import { getBlogTags } from '../../redux/slices/blogTagSlice';

const BlogEditor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  console.log({
    getBlogById,
    createBlog,
    updateBlog,
    reset,
    getBlogCategories,
    getBlogTags
  });

  const { currentBlog, isSuccess, isError, message, isLoading } =
    useSelector((state) => state.blog);

  const { blogCategories } = useSelector((state) => state.blogCategories);
  const { blogTags } = useSelector((state) => state.blogTags);

  useEffect(() => {
    dispatch(getBlogCategories());
    dispatch(getBlogTags());

    if (id) {
      dispatch(getBlogById(id));
    } else {
      dispatch(reset());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(message);
      dispatch(reset());
      navigate('/admin/blogs');
    }

    if (isError) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isSuccess, isError]);

  const handleSubmit = (formData) => {
    if (id) {
      dispatch(updateBlog({ id, data: formData }));
    } else {
      dispatch(createBlog(formData));
    }
  };

  return (
    <AdminLayout>
      <BlogForm
        blog={currentBlog}
        categories={blogCategories}
        tags={blogTags}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/blogs')}
        isLoading={isLoading}
      />
    </AdminLayout>
  );
};

export default BlogEditor;