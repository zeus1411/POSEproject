import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const API = "/orders/admin";

// Lấy toàn bộ đơn hàng (admin)
export const fetchAdminOrders = createAsyncThunk(
    "adminOrders/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.status && params.status !== 'ALL') queryParams.append('status', params.status);
            if (params.search) queryParams.append('search', params.search);

            const res = await api.get(`${API}/all?${queryParams.toString()}`, { withCredentials: true });

            const raw = res.data;

            // Return both orders and pagination
            if (raw.data?.orders) {
                return {
                    orders: raw.data.orders,
                    pagination: raw.data.pagination
                };
            }
            if (Array.isArray(raw)) return { orders: raw, pagination: null };
            if (Array.isArray(raw.orders)) return { orders: raw.orders, pagination: null };

            return { orders: [], pagination: null };
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
        filters: {
            status: 'ALL',
            search: '',
            page: 1,
            limit: 10
        },
        pagination: {
            total: 0,
            pages: 1,
            page: 1,
            limit: 10
        }
    },
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
            state.error = null;
        },
        setFilters: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload
            };
        },
        clearFilters: (state) => {
            state.filters = {
                status: 'ALL',
                search: '',
                page: 1,
                limit: 10
            };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.orders || action.payload;
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination;
                }
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
export const { clearCurrentOrder, setFilters, clearFilters } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;