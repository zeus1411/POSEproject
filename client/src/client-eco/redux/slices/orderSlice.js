import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderService from '../../services/orderService';

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue, getState, dispatch }) => {
    try {
      const updatedOrder = await orderService.cancelOrder(orderId, reason);
      
      // Sau khi cancel thành công, dispatch action để update list
      // Điều này sẽ được xử lý trong reducer
      return updatedOrder;
    } catch (err) {
      console.error('Error in cancelOrder thunk:', err);
      return rejectWithValue(err.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  }
);

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

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const order = await orderService.getOrderById(orderId);
      return order;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải chi tiết đơn hàng'
      );
    }
  }
);

const initialState = {
  orders: [],
  orderDetail: null,
  orderDetailLoading: false,
  orderDetailError: null,
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
    },
    setOrderDetail: (state, action) => {
      state.orderDetail = action.payload;
      state.orderDetailLoading = false;
      state.orderDetailError = null;
    },
    // ✅ FIXED: Dùng reducer thông thường thay vì createAction
    updateOrderInList: (state, action) => {
      const updatedOrder = action.payload;
      
      // Update in orders list
      const orderIndex = state.orders.findIndex(o => o._id === updatedOrder._id);
      const activeFilter = state.filter?.status || '';
      const matchesFilter = !activeFilter || updatedOrder.status === activeFilter;

      if (orderIndex !== -1) {
        if (matchesFilter) {
          // Cập nhật order nếu vẫn match filter
          state.orders[orderIndex] = updatedOrder;
        } else {
          // Xóa khỏi list nếu không match filter nữa
          state.orders.splice(orderIndex, 1);
          // Giảm total count
          if (state.pagination.total > 0) {
            state.pagination.total -= 1;
          }
        }
      } else if (matchesFilter) {
        // Thêm vào đầu list nếu chưa có và match filter
        state.orders.unshift(updatedOrder);
        state.pagination.total += 1;
      }
      
      // Update order detail if it's the current one
      if (state.orderDetail?._id === updatedOrder._id) {
        state.orderDetail = updatedOrder;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Order By ID
      .addCase(fetchOrderById.pending, (state) => {
        state.orderDetailLoading = true;
        state.orderDetailError = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.orderDetailLoading = false;
        state.orderDetail = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.orderDetailLoading = false;
        state.orderDetailError = action.payload;
        state.orderDetail = null;
      })
      
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.orderDetailLoading = true;
        state.orderDetailError = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.orderDetailLoading = false;
        const updatedOrder = action.payload;
        
        // ✅ Update orderDetail
        state.orderDetail = updatedOrder;
        
        // ✅ Update in orders list
        const orderIndex = state.orders.findIndex(o => o._id === updatedOrder._id);
        const activeFilter = state.filter?.status || '';
        const matchesFilter = !activeFilter || updatedOrder.status === activeFilter;

        if (orderIndex !== -1) {
          if (matchesFilter) {
            state.orders[orderIndex] = updatedOrder;
          } else {
            // Xóa khỏi list nếu không còn match filter
            state.orders.splice(orderIndex, 1);
            if (state.pagination.total > 0) {
              state.pagination.total -= 1;
            }
          }
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.orderDetailLoading = false;
        state.orderDetailError = action.payload;
      });
  }
});

export const { 
  setOrderStatusFilter, 
  clearOrders, 
  setOrderDetail,
  updateOrderInList 
} = orderSlice.actions;

export default orderSlice.reducer;