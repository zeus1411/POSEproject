import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:3000/api/v1/orders/admin"; 

// Lấy toàn bộ đơn hàng (admin)
export const fetchAdminOrders = createAsyncThunk(
  "adminOrders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/all`, { withCredentials: true });

      const raw = res.data;

      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw.orders)) return raw.orders;
      if (Array.isArray(raw.data?.orders)) return raw.data.orders;

      return [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// Admin cập nhật trạng thái đơn hàng
export const updateAdminOrderStatus = createAsyncThunk(
  "adminOrders/updateStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${API}/${orderId}/status`,
        { status },
        { withCredentials: true }
      );
      return res.data.data.order; 
    } catch (err) {
      // Thêm log này để thấy rõ lỗi 400
      console.error("Lỗi 400:", err.response.data.message); 
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        const updated = action.payload;

        // ✅ Chỉ giữ lại đoạn code an toàn này
        if (updated && updated._id) { 
            const index = state.list.findIndex(o => o._id === updated._id);
            if (index !== -1) {
            state.list[index] = updated;
            }
        } else {
            // Log ra nếu backend không trả về order 
            // (giúp bạn biết để sửa backend nếu cần)
            console.warn(
            "Cập nhật thành công nhưng backend không trả về order object."
            );
        }
    });
  },
});

export default adminOrderSlice.reducer;