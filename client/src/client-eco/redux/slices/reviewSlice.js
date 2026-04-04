import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as reviewService from "../../services/reviewService";

// Lấy danh sách đánh giá của 1 sản phẩm
export const fetchReviews = createAsyncThunk(
  "reviews/fetchReviews",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await reviewService.getProductReviews(productId);
      return response.reviews || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi khi tải đánh giá");
    }
  }
);

// Gửi đánh giá mới
export const createReview = createAsyncThunk(
  "reviews/createReview",
  async ({ productId, rating, title, comment, orderId }, { rejectWithValue }) => {
    try {
      const response = await reviewService.createReview({
        productId,
        rating,
        title,
        comment,
        orderId
      });
      return response.review;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi gửi đánh giá");
    }
  }
);

// Kiểm tra trạng thái review của user
export const checkReviewStatus = createAsyncThunk(
  "reviews/checkReviewStatus",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await reviewService.checkReviewStatus(productId);
      return response; // { purchased: bool, hasReviewed: bool }
    } catch (err) {
      return rejectWithValue({ purchased: false, hasReviewed: false });
    }
  }
);
const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    list: [],
    loading: false,
    error: null,
    purchased: false,
    hasReviewed: false,
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
      .addCase(createReview.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.hasReviewed = true;
      })
    // .addCase(checkPurchased.fulfilled, (state, action) => {
    //   state.purchased = action.payload;
    // });

  // ✅ Cập nhật reducer cho thunk mới
      .addCase(checkReviewStatus.fulfilled, (state, action) => {
        state.purchased = action.payload.purchased;
        state.hasReviewed = action.payload.hasReviewed;
      });
  },
});

export default reviewSlice.reducer;