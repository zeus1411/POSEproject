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
    limit: 10
  },
  filters: {
    search: '',
    categoryId: '',
    status: '',
    page: 1,
    limit: 10
  }
};

// Get all products (admin)
export const getAllProductsAdmin = createAsyncThunk(
  'adminProducts/getAllProductsAdmin',
  async (params = {}, thunkAPI) => {
    try {
      return await productService.getAllProductsAdmin(params);
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

// Get product by ID (admin)
export const getProductByIdAdmin = createAsyncThunk(
  'adminProducts/getProductByIdAdmin',
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

// Create product
export const createProductAdmin = createAsyncThunk(
  'adminProducts/createProductAdmin',
  async (formData, thunkAPI) => {
    try {
      return await productService.createProduct(formData);
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

// Update product
export const updateProductAdmin = createAsyncThunk(
  'adminProducts/updateProductAdmin',
  async ({ productId, formData }, thunkAPI) => {
    try {
      return await productService.updateProduct(productId, formData);
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

// Delete product
export const deleteProductAdmin = createAsyncThunk(
  'adminProducts/deleteProductAdmin',
  async (productId, thunkAPI) => {
    try {
      await productService.deleteProduct(productId);
      return productId;
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

// Update product images
export const updateProductImagesAdmin = createAsyncThunk(
  'adminProducts/updateProductImagesAdmin',
  async ({ productId, imageUrls }, thunkAPI) => {
    try {
      return await productService.updateProductImages(productId, imageUrls);
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

export const adminProductSlice = createSlice({
  name: 'adminProducts',
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
        status: '',
        page: 1,
        limit: 10
      };
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all products
      .addCase(getAllProductsAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getAllProductsAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = Array.isArray(action.payload) ? action.payload : action.payload.items || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getAllProductsAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.products = [];
      })
      // Get product by ID
      .addCase(getProductByIdAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getProductByIdAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentProduct = action.payload;
      })
      .addCase(getProductByIdAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.currentProduct = null;
      })
      // Create product
      .addCase(createProductAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(createProductAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products.unshift(action.payload);
        state.message = 'Tạo sản phẩm thành công';
      })
      .addCase(createProductAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update product
      .addCase(updateProductAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(updateProductAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.currentProduct = action.payload;
        state.message = 'Cập nhật sản phẩm thành công';
      })
      .addCase(updateProductAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete product
      .addCase(deleteProductAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(deleteProductAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = state.products.filter(p => p._id !== action.payload);
        state.message = 'Xóa sản phẩm thành công';
      })
      .addCase(deleteProductAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update product images
      .addCase(updateProductImagesAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(updateProductImagesAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload.product) {
          const index = state.products.findIndex(p => p._id === action.payload.product._id);
          if (index !== -1) {
            state.products[index] = action.payload.product;
          }
          state.currentProduct = action.payload.product;
        }
        state.message = action.payload.message || 'Cập nhật ảnh sản phẩm thành công';
      })
      .addCase(updateProductImagesAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, setError, setFilters, clearFilters, clearCurrentProduct } = adminProductSlice.actions;
export default adminProductSlice.reducer;
