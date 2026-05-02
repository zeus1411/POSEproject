import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import blogService from '../../services/blogService';

const initialState = {
  blogs: [],
  currentBlog: null,
  page: 1,
  totalPages: 1,
  total: 0,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

export const getBlogById = createAsyncThunk(
  'blog/getBlogById',
  async (id, thunkAPI) => {
    try {
      return await blogService.getBlogById(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createBlog = createAsyncThunk(
  'blog/create',
  async (data, thunkAPI) => {
    try {
      return await blogService.createBlog(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blog/update',
  async ({ id, data }, thunkAPI) => {
    try {
      return await blogService.updateBlog(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getAllBlogs = createAsyncThunk(
  'blog/getAll',
  async (params, thunkAPI) => {
    try {
      return await blogService.getAllBlogs(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blog/delete',
  async (id, thunkAPI) => {
    try {
      return await blogService.deleteBlog(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const getPublicBlogs = createAsyncThunk(
  'blog/getPublic',
  async (params, thunkAPI) => {
    try {
      return await blogService.getPublicBlogs(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const updateBlogStatus =
 createAsyncThunk(
  'blog/updateStatus',

  async(data, thunkAPI)=>{

   try{

    return await blogService
      .updateBlogStatus(
       data.id,
       data.status,
       data.rejectionReason
    );

   }catch(err){

    return thunkAPI.rejectWithValue(
      err.response?.data?.message
    );

   }

 });

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBlogById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBlogById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBlog = action.payload.blog;
      })
      .addCase(createBlog.fulfilled, (state) => {
        state.isSuccess = true;
        state.message = 'Tạo bài viết thành công';
      })
      .addCase(updateBlog.fulfilled, (state) => {
        state.isSuccess = true;
        state.message = 'Cập nhật bài viết thành công';
      })
      .addCase(getAllBlogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload.blogs || [];
        state.total = action.payload.pagination?.total || 0;
        state.page = action.payload.pagination?.page || 1;
        state.totalPages = action.payload.pagination?.pages || 1;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.message = 'Xoá bài viết thành công';

        // Remove from list
        state.blogs = state.blogs.filter(
          (blog) => blog._id !== action.meta.arg
        );
      })

      .addCase(getPublicBlogs.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(getPublicBlogs.fulfilled, (state, action) => {
        state.isLoading = false;

        state.blogs = action.payload.blogs;

        // vì BE của bạn trả pagination object
        state.total = action.payload.pagination.total;

        state.page = action.payload.pagination.page;

        state.totalPages = action.payload.pagination.pages;
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.isError = true;
          state.message = action.payload;
        }
      );
  }
});

export const { reset, clearCurrentBlog } = blogSlice.actions;
export default blogSlice.reducer;