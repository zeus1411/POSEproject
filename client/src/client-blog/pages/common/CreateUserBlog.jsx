import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import BlogForm from '../../components/admin/BlogForm';

import {
  getBlogById,
  createBlog,
  updateBlog,
  reset,
  clearCurrentBlog
} from '../../redux/slices/blogSlice';

import { getBlogCategories } from '../../redux/slices/blogCategorySlice';
import { getBlogTags } from '../../redux/slices/blogTagSlice';

const CreateUserBlog = () => {
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
      dispatch(clearCurrentBlog());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(message);
      dispatch(reset());
      navigate('/blogs');
    }

    if (isError) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isSuccess, isError]);

  const handleSubmit = (formData) => {
    if (isLoading) return;
    if (id) {
      dispatch(updateBlog({ id, data: formData }));
    } else {
      dispatch(createBlog(formData));
    }
  };

    return (
    <BlogForm
        blog={currentBlog}
        categories={blogCategories}
        tags={blogTags}
        onSubmit={handleSubmit}
        onCancel={() => {
          dispatch(clearCurrentBlog());
          navigate('/blogs');
        }}
        isLoading={isLoading}
        isAdmin={false}
    />
    );
};

export default CreateUserBlog;
