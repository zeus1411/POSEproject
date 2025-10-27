import api from './api';

const productService = {
  // Get all products
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Search products with filters
  searchProducts: async (params = {}) => {
    const response = await api.get('/products/search', { params });
    return response.data;
  },

  // Get product by ID
  getProductById: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get('/products/search', {
      params: {
        featured: true,
        limit
      }
    });
    return response.data.items || response.data;
  },

  // Get new products
  getNewProducts: async (limit = 8) => {
    const response = await api.get('/products/search', {
      params: {
        isNew: true,
        limit
      }
    });
    return response.data.items || response.data;
  },

  // Get best sellers
  getBestSellers: async (limit = 8) => {
    const response = await api.get('/products/search', {
      params: {
        sort: 'soldCount:desc',
        limit
      }
    });
    return response.data.items || response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await api.get('/products/search', {
      params: {
        categoryId,
        ...params
      }
    });
    return response.data;
  },

  // Get related products
  getRelatedProducts: async (productId, limit = 4) => {
    const response = await api.get(`/products/${productId}/related`, {
      params: { limit }
    });
    return response.data;
  }
};

export default productService;
