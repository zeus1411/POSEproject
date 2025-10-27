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
  async (_, thunkAPI) => {
    try {
      return await categoryService.getCategories();
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
      });
  },
});

export const { reset, setError, clearCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;
