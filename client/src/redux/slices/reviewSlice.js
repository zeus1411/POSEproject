import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/reviews"; // đổi theo backend của bạn

// Lấy danh sách đánh giá của 1 sản phẩm
export const fetchReviews = createAsyncThunk(
  "reviews/fetchReviews",
  async (productId) => {
    const res = await axios.get(`${API_URL}/product/${productId}`);
    return res.data;
  }
);

// Gửi đánh giá mới
export const addReview = createAsyncThunk(
  "reviews/addReview",
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/product/${productId}`, reviewData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      });
  },
});

export default reviewSlice.reducer;