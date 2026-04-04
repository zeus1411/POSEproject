import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

const initialState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
    limit: 12
  },
  filters: {
    search: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    inStock: '',
    sort: 'createdAt:desc'
  }
};

// Get all products
export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (params = {}, thunkAPI) => {
    try {
      return await productService.getProducts(params);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Search products with filters
export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (params = {}, thunkAPI) => {
    try {
      return await productService.searchProducts(params);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get product by ID
export const getProductById = createAsyncThunk(
  'products/getProductById',
  async (productId, thunkAPI) => {
    try {
      return await productService.getProductById(productId);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get featured products
export const getFeaturedProducts = createAsyncThunk(
  'products/getFeaturedProducts',
  async (limit = 8, thunkAPI) => {
    try {
      return await productService.getFeaturedProducts(limit);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get new products
export const getNewProducts = createAsyncThunk(
  'products/getNewProducts',
  async (limit = 8, thunkAPI) => {
    try {
      return await productService.getNewProducts(limit);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get best sellers
export const getBestSellers = createAsyncThunk(
  'products/getBestSellers',
  async (limit = 8, thunkAPI) => {
    try {
      return await productService.getBestSellers(limit);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setError: (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
      state.isSuccess = false;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        categoryId: '',
        minPrice: '',
        maxPrice: '',
        inStock: '',
        sort: 'createdAt:desc'
      };
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get products
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.products = [];
      })
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = action.payload.items || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.products = [];
      })
      // Get product by ID
      .addCase(getProductById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentProduct = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.currentProduct = null;
      })
      // Get featured products
      .addCase(getFeaturedProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Store featured products separately or in a specific field
        state.featuredProducts = action.payload;
      })
      .addCase(getFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get new products
      .addCase(getNewProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNewProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.newProducts = action.payload;
      })
      .addCase(getNewProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get best sellers
      .addCase(getBestSellers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBestSellers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.bestSellers = action.payload;
      })
      .addCase(getBestSellers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setError, setFilters, clearFilters, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;