import api from '../../client-eco/services/api';

const blogCategoryService = {
  getBlogCategories: async (includeInactive = true) => {
    const response = await api.get('/blog-categories', {
      params: { includeInactive }
    });
    return response.data;
  },

  getBlogCategoryById: async (categoryId) => {
    const response = await api.get(`/blog-categories/${categoryId}`);
    return response.data;
  },

  createBlogCategory: async (categoryData) => {
    const response = await api.post('/blog-categories', categoryData);
    return response.data;
  },

  updateBlogCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/blog-categories/${categoryId}`, categoryData);
    return response.data;
  },

  deleteBlogCategory: async (categoryId) => {
    const response = await api.delete(`/blog-categories/${categoryId}`);
    return response.data;
  },

  updateBlogCategoryStatus: async (categoryId, isActive) => {
    const response = await api.patch(`/blog-categories/${categoryId}`, { isActive });
    return response.data;
  }
};

export default blogCategoryService;