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
    // Include includeInactive parameter to allow fetching inactive products
    const response = await api.get(`/products/${productId}`, {
      params: {
        includeInactive: 'true'  // Always include inactive for admin
      }
    });
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
  
  // Get all products (admin - includes inactive by default)
  getAllProductsAdmin: async (params = {}) => {
    const { page = 1, limit = 10, status, categoryId, search, sort } = params;
    
    // Build query params
    const queryParams = {
      page,
      limit,
      // Always include inactive for admin
      includeInactive: 'true'
    };
    
    // Only add status to query if it's explicitly set (including empty string)
    if (status !== undefined) {
      queryParams.status = status;
    }
    
    // Add other optional parameters
    if (categoryId) queryParams.categoryId = categoryId;
    if (search) queryParams.q = search;
    if (sort) queryParams.sort = sort;

    const response = await api.get('/products/search', { params: queryParams });
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
