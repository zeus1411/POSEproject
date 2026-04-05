import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import blogTagService from '../../services/blogTagService';

const initialState = {
  blogTags: [],
  currentBlogTag: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// GET ALL
export const getBlogTags = createAsyncThunk(
  'blogTags/getBlogTags',
  async (includeInactive = false, thunkAPI) => {
    try {
      return await blogTagService.getBlogTags(includeInactive);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// GET BY ID
export const getBlogTagById = createAsyncThunk(
  'blogTags/getBlogTagById',
  async (tagId, thunkAPI) => {
    try {
      return await blogTagService.getBlogTagById(tagId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// CREATE
export const createBlogTag = createAsyncThunk(
  'blogTags/createBlogTag',
  async (tagData, thunkAPI) => {
    try {
      return await blogTagService.createBlogTag(tagData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// UPDATE
export const updateBlogTag = createAsyncThunk(
  'blogTags/updateBlogTag',
  async ({ tagId, tagData }, thunkAPI) => {
    try {
      return await blogTagService.updateBlogTag(tagId, tagData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// DELETE
export const deleteBlogTag = createAsyncThunk(
  'blogTags/deleteBlogTag',
  async (tagId, thunkAPI) => {
    try {
      return await blogTagService.deleteBlogTag(tagId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// TOGGLE STATUS
export const updateBlogTagStatus = createAsyncThunk(
  'blogTags/updateBlogTagStatus',
  async ({ tagId, isActive }, thunkAPI) => {
    try {
      return await blogTagService.updateBlogTagStatus(tagId, isActive);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const blogTagSlice = createSlice({
  name: 'blogTags',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentBlogTag: (state) => {
      state.currentBlogTag = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBlogTags.fulfilled, (state, action) => {
        state.blogTags = Array.isArray(action.payload) ? action.payload : [];
        state.isSuccess = true;
      })

      .addCase(getBlogTagById.fulfilled, (state, action) => {
        state.currentBlogTag = action.payload;
        state.isSuccess = true;
      })

      .addCase(createBlogTag.fulfilled, (state, action) => {
        state.blogTags.push(action.payload);
        state.message = 'Tạo tag thành công';
        state.isSuccess = true;
      })

      .addCase(updateBlogTag.fulfilled, (state, action) => {
        const index = state.blogTags.findIndex(
          (tag) => tag._id === action.payload._id
        );
        if (index !== -1) {
          state.blogTags[index] = action.payload;
        }
        state.message = 'Cập nhật tag thành công';
        state.isSuccess = true;
      })

      .addCase(deleteBlogTag.fulfilled, (state, action) => {
        state.blogTags = state.blogTags.filter(
          (tag) => tag._id !== action.meta.arg
        );
        state.message = 'Xóa tag thành công';
        state.isSuccess = true;
      })

      .addCase(updateBlogTagStatus.fulfilled, (state, action) => {
        const index = state.blogTags.findIndex(
          (tag) => tag._id === action.payload._id
        );
        if (index !== -1) {
          state.blogTags[index] = action.payload;
        }
        state.message = 'Cập nhật trạng thái tag';
        state.isSuccess = true;
      })

      .addMatcher(
        (action) => action.type.startsWith('blogTags/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
        }
      )

      .addMatcher(
        (action) => action.type.startsWith('blogTags/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  }
});

export const { reset, clearCurrentBlogTag } = blogTagSlice.actions;
export default blogTagSlice.reducer;