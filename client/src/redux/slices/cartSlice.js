import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartService from '../../services/cartService';

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
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(productId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(productId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật giỏ hàng');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await cartService.removeFromCart(productId);
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
  successMessage: null
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
        
        // Calculate summary
        const items = action.payload.cart.items || [];
        let totalItems = 0;
        let subtotal = 0;
        
        items.forEach(item => {
          if (item.productId) {
            const price = item.productId.salePrice || item.productId.price;
            const discount = item.productId.discount || 0;
            const itemTotal = price * item.quantity * (1 - discount / 100);
            totalItems += item.quantity;
            subtotal += itemTotal;
          }
        });
        
        const shippingFee = subtotal >= 500000 ? 0 : 30000;
        state.summary = {
          totalItems,
          subtotal,
          shippingFee,
          total: subtotal + shippingFee
        };
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.successMessage = 'Đã cập nhật giỏ hàng';
        
        // Calculate summary
        const items = action.payload.cart.items || [];
        let totalItems = 0;
        let subtotal = 0;
        
        items.forEach(item => {
          if (item.productId) {
            const price = item.productId.salePrice || item.productId.price;
            const discount = item.productId.discount || 0;
            const itemTotal = price * item.quantity * (1 - discount / 100);
            totalItems += item.quantity;
            subtotal += itemTotal;
          }
        });
        
        const shippingFee = subtotal >= 500000 ? 0 : 30000;
        state.summary = {
          totalItems,
          subtotal,
          shippingFee,
          total: subtotal + shippingFee
        };
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.successMessage = 'Đã xóa sản phẩm khỏi giỏ hàng';
        
        // Calculate summary
        const items = action.payload.cart.items || [];
        let totalItems = 0;
        let subtotal = 0;
        
        items.forEach(item => {
          if (item.productId) {
            const price = item.productId.salePrice || item.productId.price;
            const discount = item.productId.discount || 0;
            const itemTotal = price * item.quantity * (1 - discount / 100);
            totalItems += item.quantity;
            subtotal += itemTotal;
          }
        });
        
        const shippingFee = subtotal >= 500000 ? 0 : 30000;
        state.summary = {
          totalItems,
          subtotal,
          shippingFee,
          total: subtotal + shippingFee
        };
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
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
      });
  }
});

export const { clearCartError, clearCartSuccess, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
