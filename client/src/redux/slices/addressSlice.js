import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🌐 URL base (tuỳ theo server của bạn)
const API_URL = "http://localhost:3000/api/v1/addresses";

// --- Fetch danh sách địa chỉ ---
export const fetchAddresses = createAsyncThunk(
  "address/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(API_URL);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi khi tải địa chỉ");
    }
  }
);

// --- Thêm địa chỉ ---
export const addAddress = createAsyncThunk(
  "address/addAddress",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(API_URL, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi khi thêm địa chỉ");
    }
  }
);

// --- Cập nhật địa chỉ ---
export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi khi cập nhật địa chỉ");
    }
  }
);

// --- Xóa địa chỉ ---
export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi khi xóa địa chỉ");
    }
  }
);

// --- Slice ---
const addressSlice = createSlice({
  name: "address",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addAddress.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // Update
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.list.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })

      // Delete
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.list = state.list.filter((a) => a._id !== action.payload);
      });
  },
});

export default addressSlice.reducer;