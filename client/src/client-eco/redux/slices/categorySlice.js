import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../services/categoryService';

const initialState = {
  categories: [],
  categoryTree: [],
  currentCategory: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Get all categories
export const getCategories = createAsyncThunk(
  'categories/getCategories',
  async (includeInactive = false, thunkAPI) => {
    try {
      return await categoryService.getCategories(includeInactive);
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

// Get category tree
export const getCategoryTree = createAsyncThunk(
  'categories/getCategoryTree',
  async (_, thunkAPI) => {
    try {
      return await categoryService.getCategoryTree();
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

// Get root categories
export const getRootCategories = createAsyncThunk(
  'categories/getRootCategories',
  async (_, thunkAPI) => {
    try {
      return await categoryService.getRootCategories();
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

// Get category by ID
export const getCategoryById = createAsyncThunk(
  'categories/getCategoryById',
  async (categoryId, thunkAPI) => {
    try {
      return await categoryService.getCategoryById(categoryId);
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

// Create category (Admin)
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, thunkAPI) => {
    try {
      return await categoryService.createCategory(categoryData);
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

// Update category (Admin)
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ categoryId, categoryData }, thunkAPI) => {
    try {
      return await categoryService.updateCategory(categoryId, categoryData);
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

// Delete category (Admin)
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (categoryId, thunkAPI) => {
    try {
      return await categoryService.deleteCategory(categoryId);
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

// Update category status (Admin)
export const updateCategoryStatus = createAsyncThunk(
  'categories/updateCategoryStatus',
  async ({ categoryId, isActive }, thunkAPI) => {
    try {
      return await categoryService.updateCategoryStatus(categoryId, isActive);
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

export const categorySlice = createSlice({
  name: 'categories',
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
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get categories
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.categories = [];
      })
      // Get category tree
      .addCase(getCategoryTree.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCategoryTree.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.categoryTree = action.payload;
      })
      .addCase(getCategoryTree.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.categoryTree = [];
      })
      // Get root categories
      .addCase(getRootCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRootCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rootCategories = action.payload;
      })
      .addCase(getRootCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get category by ID
      .addCase(getCategoryById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentCategory = action.payload;
      })
      .addCase(getCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.currentCategory = null;
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Tạo danh mục thành công';
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Cập nhật danh mục thành công';
        const index = state.categories.findIndex(cat => cat._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Xóa danh mục thành công';
        state.categories = state.categories.filter(cat => cat._id !== action.meta.arg);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update category status
      .addCase(updateCategoryStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCategoryStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = `Đã ${action.payload.isActive ? 'kích hoạt' : 'vô hiệu hóa'} danh mục`;
        const index = state.categories.findIndex(cat => cat._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategoryStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setError, clearCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;
