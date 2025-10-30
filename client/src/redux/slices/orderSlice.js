import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderService from '../../services/orderService';

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async ({ page = 1, limit = 10, status }, { rejectWithValue }) => {
    try {
      const res = await orderService.getUserOrders(page, limit, status);
      return res; // { orders, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Không thể tải đơn hàng');
    }
  }
);

const initialState = {
  orders: [],
  pagination: { page: 1, pages: 1, total: 0, limit: 10 },
  loading: false,
  error: null,
  filter: { status: '' }
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrderStatusFilter: (state, action) => {
      state.filter.status = action.payload || '';
    },
    clearOrders: (state) => {
      Object.assign(state, initialState);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state)=>{
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action)=>{
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchUserOrders.rejected, (state, action)=>{
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setOrderStatusFilter, clearOrders } = orderSlice.actions;
export default orderSlice.reducer;
