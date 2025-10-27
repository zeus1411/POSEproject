import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

// Thunk để lấy danh sách sản phẩm
export const fetchProducts = createAsyncThunk(
  'product/fetchAll',
  async (query, thunkAPI) => {
    try {
      return await productService.getProducts(query);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;