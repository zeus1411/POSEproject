import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  promotions: [],
  currentPromotion: null,
  availablePromotions: [],
  appliedPromotions: [],
  totalDiscount: 0,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  isLoading: false,
  isError: false,
  error: null,
  message: ''
};

// ==================== ADMIN THUNKS ====================

// Get all promotions (Admin)
export const getAllPromotions = createAsyncThunk(
  'promotions/getAllPromotions',
  async ({ page = 1, limit = 20, filters = {} }, { rejectWithValue }) => {
    try {
      // Filter out empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );
      const params = new URLSearchParams({ page, limit, ...cleanFilters });
      const response = await api.get(`/promotions?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách khuyến mãi');
    }
  }
);

// Get promotion by ID
export const getPromotionById = createAsyncThunk(
  'promotions/getPromotionById',
  async (promotionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/promotions/${promotionId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải thông tin khuyến mãi');
    }
  }
);

// Create promotion
export const createPromotion = createAsyncThunk(
  'promotions/createPromotion',
  async (promotionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/promotions', promotionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tạo chương trình khuyến mãi');
    }
  }
);

// Update promotion
export const updatePromotion = createAsyncThunk(
  'promotions/updatePromotion',
  async ({ promotionId, promotionData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/promotions/${promotionId}`, promotionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật khuyến mãi');
    }
  }
);

// Delete promotion
export const deletePromotion = createAsyncThunk(
  'promotions/deletePromotion',
  async (promotionId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/promotions/${promotionId}`);
      return { promotionId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa khuyến mãi');
    }
  }
);

// Toggle promotion status
export const togglePromotionStatus = createAsyncThunk(
  'promotions/togglePromotionStatus',
  async (promotionId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/promotions/${promotionId}/toggle`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thay đổi trạng thái');
    }
  }
);

// ==================== USER THUNKS ====================

// Get available promotions
export const getAvailablePromotions = createAsyncThunk(
  'promotions/getAvailablePromotions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/promotions/available');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải khuyến mãi');
    }
  }
);

// Get promotions for product
export const getPromotionsForProduct = createAsyncThunk(
  'promotions/getPromotionsForProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/promotions/product/${productId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải khuyến mãi');
    }
  }
);

// Validate coupon
export const validateCoupon = createAsyncThunk(
  'promotions/validateCoupon',
  async ({ code, cart }, { rejectWithValue }) => {
    try {
      const response = await api.post('/promotions/validate', { code, cart });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
    }
  }
);

// Apply promotions
export const applyPromotions = createAsyncThunk(
  'promotions/applyPromotions',
  async ({ cart, promotionIds }, { rejectWithValue }) => {
    try {
      const response = await api.post('/promotions/apply', { cart, promotionIds });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể áp dụng khuyến mãi');
    }
  }
);

const promotionSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = '';
    },
    clearAppliedPromotions: (state) => {
      state.appliedPromotions = [];
      state.totalDiscount = 0;
    },
    setCurrentPromotion: (state, action) => {
      state.currentPromotion = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all promotions
      .addCase(getAllPromotions.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getAllPromotions.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('Promotions loaded:', action.payload); // Debug log
        state.promotions = action.payload.promotions || [];
        state.pagination = action.payload.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        };
      })
      .addCase(getAllPromotions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })

      // Get promotion by ID
      .addCase(getPromotionById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPromotionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPromotion = action.payload;
      })
      .addCase(getPromotionById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })

      // Create promotion
      .addCase(createPromotion.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPromotion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.promotions.unshift(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(createPromotion.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })

      // Update promotion
      .addCase(updatePromotion.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePromotion.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.promotions.findIndex(p => p._id === action.payload.data._id);
        if (index !== -1) {
          state.promotions[index] = action.payload.data;
        }
        state.currentPromotion = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(updatePromotion.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })

      // Delete promotion
      .addCase(deletePromotion.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletePromotion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.promotions = state.promotions.filter(p => p._id !== action.payload.promotionId);
        state.message = action.payload.message;
      })
      .addCase(deletePromotion.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })

      // Toggle status
      .addCase(togglePromotionStatus.fulfilled, (state, action) => {
        const index = state.promotions.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.promotions[index] = action.payload;
        }
      })

      // Get available promotions
      .addCase(getAvailablePromotions.fulfilled, (state, action) => {
        state.availablePromotions = action.payload;
      })

      // Validate coupon
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.appliedPromotions = action.payload.data.appliedPromotions;
        state.totalDiscount = action.payload.data.discount;
        state.message = action.payload.message;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.isError = true;
        state.error = action.payload;
      })

      // Apply promotions
      .addCase(applyPromotions.fulfilled, (state, action) => {
        state.appliedPromotions = action.payload.appliedPromotions;
        state.totalDiscount = action.payload.totalDiscount;
      });
  }
});

export const { 
  clearError, 
  clearMessage, 
  clearAppliedPromotions,
  setCurrentPromotion 
} = promotionSlice.actions;

export default promotionSlice.reducer;
