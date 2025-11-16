import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const API = "/orders/admin";

// Lấy toàn bộ đơn hàng (admin)
export const fetchAdminOrders = createAsyncThunk(
    "adminOrders/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get(`${API}/all`, { withCredentials: true });

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
            const res = await api.patch(
                `${API}/${orderId}/status`,
                { status },
                { withCredentials: true }
            );
            return res.data?.data?.order || res.data?.data;
        } catch (err) {
            console.error("Error updating order status:", err.response?.data?.message);
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const fetchAdminOrderDetail = createAsyncThunk(
    "adminOrders/fetchDetail",
    async (orderId, { rejectWithValue }) => {
        try {
            const res = await api.get(
                `/orders/${orderId}`, // URL này (/orders/:id) là đúng
                { withCredentials: true }
            );

            // Dựa trên logic backend trước đó, 
            // data có thể nằm trong res.data.data.order
            if (res.data?.data?.order) {
                return res.data.data.order;
            }
            // Hoặc nằm trong res.data.order
            if (res.data?.order) {
                return res.data.order;
            }
            if (res.data?.data) {
                return res.data.data;
            }
            // Fallback
            return res.data;

        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Không thể tải chi tiết đơn hàng (Lỗi 404)');
    }
    }
);

const adminOrderSlice = createSlice({
    name: "adminOrders",
    initialState: {
        list: [],
        loading: false,
        error: null,
        currentOrder: null, // ✅ Thêm state để lưu chi tiết
        loadingDetail: false, // ✅ Thêm state loading riêng cho chi tiết
    },
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
            state.error = null;
        }
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
            .addCase(updateAdminOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;

                if (updated && updated._id) {
                    const index = state.list.findIndex((o) => o._id === updated._id);
                    if (index !== -1) {
                        // Preserve the existing customer and other important fields
                        const existingOrder = state.list[index];
                        state.list[index] = {
                            ...existingOrder,    // Keep existing order data
                            ...updated,          // Apply updates
                            customer: updated.customer || existingOrder.customer, // Preserve customer info
                            orderItems: updated.orderItems || existingOrder.orderItems // Preserve order items
                        };
                    }
                } else {
                    console.warn(
                        "Cập nhật thành công nhưng backend không trả về order object."
                    );
                }
            })
            .addCase(updateAdminOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAdminOrderDetail.pending, (state) => {
                state.loadingDetail = true;
                state.currentOrder = null;
                state.error = null;
            })
            .addCase(fetchAdminOrderDetail.fulfilled, (state, action) => {
                state.loadingDetail = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchAdminOrderDetail.rejected, (state, action) => {
                state.loadingDetail = false;
                state.error = action.payload;
            });
    },
});
export const { clearCurrentOrder } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;