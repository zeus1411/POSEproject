import api from './api';

const categoryService = {
  // Get all categories (with option to include inactive for admin)
  getCategories: async (includeInactive = false) => {
    const response = await api.get('/categories', {
      params: { includeInactive }
    });
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
  },

  // Create category (Admin)
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update category (Admin)
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Delete category (Admin)
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },

  // Update category status (Admin)
  updateCategoryStatus: async (categoryId, isActive) => {
    const response = await api.patch(`/categories/${categoryId}/status`, { isActive });
    return response.data;
  }
};

export default categoryService;
