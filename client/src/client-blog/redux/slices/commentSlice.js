import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import commentService from "../../services/commentService";

export const fetchCommentsByBlog = createAsyncThunk(
  "comments/fetchByBlog",
  async (blogId, thunkAPI) => {
    try {
      return await commentService.getCommentsByBlog(blogId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Load comments thất bại"
      );
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/delete",
  async (id, thunkAPI) => {
    try {
      await commentService.deleteComment(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Xóa comment thất bại"
      );
    }
  }
);

const commentSlice = createSlice({
  name: "comments",

  initialState: {
    comments: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentsByBlog.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchCommentsByBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.comments || [];
      })

      .addCase(fetchCommentsByBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(
          (item) => item._id !== action.payload
        );
      });
  },
});

export default commentSlice.reducer;