import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/reviews"; // đổi theo backend của bạn

// Lấy danh sách đánh giá của 1 sản phẩm
export const fetchReviews = createAsyncThunk(
  "reviews/fetchReviews",
  async (productId) => {
    const res = await axios.get(`${API_URL}/${productId}`);
    return res.data.reviews;
  }
);

// Gửi đánh giá mới
export const createReview = createAsyncThunk(
  "reviews/createReview",
  async ({ productId, rating, title, comment }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/reviews",
        { productId, rating, title, comment },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      return res.data.review;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi gửi đánh giá");
    }
  }
);

// // Kiểm tra user đã mua sản phẩm chưa
// export const checkPurchased = createAsyncThunk(
//   "reviews/checkPurchased",
//   async (productId, { rejectWithValue }) => {
//     try {
//       const res = await axios.get(
//         `http://localhost:3000/api/v1/reviews/check/${productId}`,
//         { withCredentials: true }
//       );
//       return res.data.purchased;
//     } catch (err) {
//       return rejectWithValue(false);
//     }
//   }
// );

// ✅ Đổi tên thunk và cập nhật API
export const checkReviewStatus = createAsyncThunk(
  "reviews/checkReviewStatus", // Đổi tên
  async (productId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        // ✅ Cập nhật đường dẫn API
        `http://localhost:3000/api/v1/reviews/check-status/${productId}`, 
        { withCredentials: true }
      );
      return res.data; // Trả về object { purchased: bool, hasReviewed: bool }
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