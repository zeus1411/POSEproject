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
  },

  // ========== ADMIN OPERATIONS ==========
  
  // Get all products (admin - includes inactive)
  getAllProductsAdmin: async (params = {}) => {
    const response = await api.get('/products', {
      params: {
        ...params,
        includeInactive: 'true'
      }
    });
    return response.data;
  },

  // Create product (admin)
  createProduct: async (formData) => {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update product (admin)
  updateProduct: async (productId, formData) => {
    const response = await api.put(`/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update product images (admin)
  updateProductImages: async (productId, imageUrls) => {
    const response = await api.post(`/products/${productId}/update-images`, {
      imageUrls
    });
    return response.data;
  },

  // Delete product (admin)
  deleteProduct: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  }
};

export default productService;
