import api from './api';

const categoryService = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get category tree
  getCategoryTree: async () => {
    const response = await api.get('/categories/tree');
    return response.data;
  },

  // Get root categories
  getRootCategories: async () => {
    const response = await api.get('/categories/root');
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  // Get category by slug
  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  }
};

export default categoryService;
