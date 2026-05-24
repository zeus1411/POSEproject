import api from '../../client-eco/services/api';
import blogCategoryService from './blogCategoryService';
import blogTagService from './blogTagService';

const API_URL = '/blogs';

const createBlog = async (data) => {
  const res = await api.post(API_URL, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

const updateBlog = async (id, data) => {
  const res = await api.put(`${API_URL}/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

const getBlogById = async (id) => {
  const res = await api.get(`${API_URL}/${id}`);
  return res.data;
};

const getAllBlogs = async (params) => {
  const res = await api.get(API_URL, { params });
  return res.data;
};

const deleteBlog = async (id) => {
  const res = await api.delete(`${API_URL}/${id}`);
  return res.data;
};

const hideBlog = async (id, isHidden = true) => {
  const res = await api.patch(`${API_URL}/${id}/hide`, { isHidden });
  return res.data;
};

const searchProductsQuick = async (query) => {
  const res = await api.get(`/products/search-quick?q=${query}`);
  return res.data.products || [];
};

const getAllCategories = () => blogCategoryService.getBlogCategories();

const getAllTags = () => blogTagService.getBlogTags();

const likeBlog = async (blogId) => {
  const res = await api.post(`/blogs/${blogId}/like`);
  return res.data;
};

const addComment = async (blogId, content) => {
  const res = await api.post(`/blogs/${blogId}/comments`, { content });
  return res.data;
};

const increaseView = async (blogId) => {
  const res = await api.post(`/blogs/${blogId}/view`);
  return res.data;
};

const getBlogBySlug = async (slug) => {
  const res = await api.get(`/blogs/slug/${slug}`);
  return res.data;
};

const getPublicBlogs = async (params) => {
  const res = await api.get('/blogs/public', { params });
  return res.data;
};

const updateBlogStatus = async (id, status, rejectionReason) => {
  const res = await api.patch(
    `/blogs/${id}/status`,
    {
      status,
      rejectionReason
    }
  );
  return res.data;
};

// 🔥 Lấy bài viết của TÔI
const getMyBlogs = async (params = {}) => {
  // params có thể truyền { status: 'PUBLISHED' } hoặc 'PENDING', 'DRAFT'
  const res = await api.get(`${API_URL}/my-blogs`, { params });
  return res.data;
};

export default {
  createBlog,
  updateBlog,
  getBlogById,
  getAllBlogs,
  deleteBlog,
  hideBlog,
  searchProductsQuick,
  getAllCategories,
  getAllTags,
  likeBlog,
  addComment,
  increaseView,
  getBlogBySlug,
  getPublicBlogs,
  updateBlogStatus,
  getMyBlogs
};
