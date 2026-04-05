import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartService from '../../services/cartService';
import { calculateShippingFee } from '../../utils/shippingCalculator';
import { logout } from './authSlice'; // Import logout action từ authSlice

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải giỏ hàng');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1, variantId = null }, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(productId, quantity, variantId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  }
);

// OPTIMIZED: Update cart item with optimistic update
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity, variantId = null }, { rejectWithValue, getState }) => {
    try {
      const response = await cartService.updateCartItem(productId, quantity, variantId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật giỏ hàng');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ productId, variantId = null }, { rejectWithValue }) => {
    try {
      const response = await cartService.removeFromCart(productId, variantId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.clearCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa giỏ hàng');
    }
  }
);

// Helper function to calculate summary
const calculateSummary = (items) => {
  let totalItems = 0;
  let subtotal = 0;
  
  items.forEach(item => {
    if (item.productId) {
      let price = item.productId.salePrice || item.productId.price;
      
      // If item has selected variant, use variant price
      if (item.selectedVariant && item.selectedVariant.price) {
        price = item.selectedVariant.price;
      } else if (item.productId.hasVariants && item.variantId) {
        // Find variant by variantId
        const variant = item.productId.variants?.find(v => v._id === item.variantId);
        if (variant) {
          price = variant.price;
        }
      }
      
      const discount = item.productId.discount || 0;
      const itemTotal = price * item.quantity * (1 - discount / 100);
      totalItems += item.quantity;
      subtotal += itemTotal;
    }
  });
  
  // Shipping fee theo bậc thang (14%, 8%, 5%, 3%, 1.8%)
  const shippingFee = calculateShippingFee(subtotal);
  return {
    totalItems,
    subtotal,
    shippingFee,
    total: subtotal + shippingFee
  };
};

const initialState = {
  cart: null,
  summary: {
    totalItems: 0,
    subtotal: 0,
    shippingFee: 0,
    total: 0
  },
  loading: false,
  error: null,
  successMessage: null,
  isUpdating: false // New flag for update operations
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    clearCartSuccess: (state) => {
      state.successMessage = null;
    },
    resetCart: (state) => {
      state.cart = null;
      state.summary = initialState.summary;
      state.error = null;
      state.successMessage = null;
    },
    // OPTIMISTIC UPDATE: Update quantity immediately in UI
    optimisticUpdateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      if (state.cart && state.cart.items) {
        const itemIndex = state.cart.items.findIndex(
          item => item.productId._id === productId
        );
        if (itemIndex !== -1) {
          state.cart.items[itemIndex].quantity = quantity;
          // Recalculate summary
          state.summary = calculateSummary(state.cart.items);
        }
      }
    },
    // OPTIMISTIC REMOVE: Remove item immediately from UI
    optimisticRemoveItem: (state, action) => {
      const productId = action.payload;
      if (state.cart && state.cart.items) {
        state.cart.items = state.cart.items.filter(
          item => item.productId._id !== productId
        );
        // Recalculate summary
        state.summary = calculateSummary(state.cart.items);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.summary = action.payload.summary;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.successMessage = 'Đã thêm sản phẩm vào giỏ hàng';
        state.summary = calculateSummary(action.payload.cart.items || []);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Cart Item - OPTIMIZED
      .addCase(updateCartItem.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isUpdating = false;
        // Only update if data differs (avoid unnecessary re-renders)
        state.cart = action.payload.cart;
        state.summary = calculateSummary(action.payload.cart.items || []);
        // Don't show success message for quantity updates (too noisy)
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
        // Revert optimistic update by fetching fresh data
        // This will be handled in the component
      })
      
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.cart = action.payload.cart;
        state.successMessage = 'Đã xóa sản phẩm khỏi giỏ hàng';
        state.summary = calculateSummary(action.payload.cart.items || []);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.cart = { items: [] };
        state.summary = initialState.summary;
        state.successMessage = 'Đã xóa toàn bộ giỏ hàng';
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ✅ Lắng nghe logout action từ authSlice để tự động clear cart
      .addCase(logout.fulfilled, (state) => {
        state.cart = null;
        state.summary = initialState.summary;
        state.loading = false;
        state.error = null;
        state.successMessage = null;
        state.isUpdating = false;
      });
  }
});

export const { 
  clearCartError, 
  clearCartSuccess, 
  resetCart,
  optimisticUpdateQuantity,
  optimisticRemoveItem
} = cartSlice.actions;

export default cartSlice.reducer;