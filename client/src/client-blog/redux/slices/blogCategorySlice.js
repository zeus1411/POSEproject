import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import blogCategoryService from '../../services/blogCategoryService';

const initialState = {
  blogCategories: [],
  currentBlogCategory: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Get all blog categories
export const getBlogCategories = createAsyncThunk(
  'blogCategories/getBlogCategories',
  async (includeInactive = false, thunkAPI) => {
    try {
      return await blogCategoryService.getBlogCategories(includeInactive);
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

// Get blog category by ID
export const getBlogCategoryById = createAsyncThunk(
  'blogCategories/getBlogCategoryById',
  async (categoryId, thunkAPI) => {
    try {
      return await blogCategoryService.getBlogCategoryById(categoryId);
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

// Create blog category
export const createBlogCategory = createAsyncThunk(
  'blogCategories/createBlogCategory',
  async (categoryData, thunkAPI) => {
    try {
      return await blogCategoryService.createBlogCategory(categoryData);
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

// Update blog category
export const updateBlogCategory = createAsyncThunk(
  'blogCategories/updateBlogCategory',
  async ({ categoryId, categoryData }, thunkAPI) => {
    try {
      return await blogCategoryService.updateBlogCategory(categoryId, categoryData);
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

// Delete blog category
export const deleteBlogCategory = createAsyncThunk(
  'blogCategories/deleteBlogCategory',
  async (categoryId, thunkAPI) => {
    try {
      return await blogCategoryService.deleteBlogCategory(categoryId);
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

// Update blog category status
export const updateBlogCategoryStatus = createAsyncThunk(
  'blogCategories/updateBlogCategoryStatus',
  async ({ categoryId, isActive }, thunkAPI) => {
    try {
      return await blogCategoryService.updateBlogCategoryStatus(categoryId, isActive);
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

export const blogCategorySlice = createSlice({
  name: 'blogCategories',
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
    clearCurrentBlogCategory: (state) => {
      state.currentBlogCategory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get blog categories
      .addCase(getBlogCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBlogCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.blogCategories = action.payload.categories;
      })
      .addCase(getBlogCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.blogCategories = [];
      })

      // Get blog category by ID
      .addCase(getBlogCategoryById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBlogCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentBlogCategory = action.payload.category;
      })
      .addCase(getBlogCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.currentBlogCategory = null;
      })

      // Create blog category
      .addCase(createBlogCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBlogCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Tạo danh mục bài viết thành công';
        state.blogCategories.push(action.payload.category);
      })
      .addCase(createBlogCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Update blog category
      .addCase(updateBlogCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateBlogCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Cập nhật danh mục bài viết thành công';

        const index = state.blogCategories.findIndex(
          (cat) => cat._id === action.payload.category._id
        );

        if (index !== -1) {
          state.blogCategories[index] = action.payload.category;
        }
      })
      .addCase(updateBlogCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Delete blog category
      .addCase(deleteBlogCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteBlogCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Xóa danh mục bài viết thành công';
        state.blogCategories = state.blogCategories.filter(
          (cat) => cat._id !== action.meta.arg
        );
      })
      .addCase(deleteBlogCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Update blog category status
      .addCase(updateBlogCategoryStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateBlogCategoryStatus.fulfilled, (state, action) => {
        console.log('STATUS RESPONSE:', action.payload);
        state.isLoading = false;
        state.isSuccess = true;

        const updatedCategory = action.payload.category;

        state.message = `Đã ${
          updatedCategory.isActive ? 'kích hoạt' : 'vô hiệu hóa'
        } danh mục bài viết`;

        const index = state.blogCategories.findIndex(
          (cat) => cat._id === updatedCategory._id
        );

        if (index !== -1) {
          state.blogCategories[index] = updatedCategory;
        }
      })
      .addCase(updateBlogCategoryStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setError, clearCurrentBlogCategory } = blogCategorySlice.actions;
export default blogCategorySlice.reducer;