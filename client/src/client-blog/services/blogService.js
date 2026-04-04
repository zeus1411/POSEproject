import api from '../../client-eco/services/api';

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

const searchProductsQuick = async (query) => {
  const res = await api.get(`/products/search-quick?q=${query}`);
  return res.data; // array các sản phẩm { _id, name, sku, price, images, slug }
};

export default {
  createBlog,
  updateBlog,
  getBlogById,
  getAllBlogs,
  deleteBlog,
  searchProductsQuick
};