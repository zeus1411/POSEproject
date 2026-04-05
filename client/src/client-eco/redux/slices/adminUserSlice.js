import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

const initialState = {
  users: [],
  currentUser: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  pagination: {
    totalUsers: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10
  },
  filters: {
    search: '',
    role: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  }
};

// Get all users (admin)
export const getAllUsersAdmin = createAsyncThunk(
  'adminUsers/getAllUsersAdmin',
  async (params = {}, thunkAPI) => {
    try {
      const response = await userService.getAllUsersAdmin(params);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user by ID (admin)
export const getUserByIdAdmin = createAsyncThunk(
  'adminUsers/getUserByIdAdmin',
  async (userId, thunkAPI) => {
    try {
      const response = await userService.getUserByIdAdmin(userId);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update user (admin)
export const updateUserAdmin = createAsyncThunk(
  'adminUsers/updateUserAdmin',
  async ({ userId, formData }, thunkAPI) => {
    try {
      const response = await userService.updateUserByAdmin(userId, formData);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete user (admin)
export const deleteUserAdmin = createAsyncThunk(
  'adminUsers/deleteUserAdmin',
  async (userId, thunkAPI) => {
    try {
      await userService.deleteUserByAdmin(userId);
      return userId;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const adminUserSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setError: (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
      state.isSuccess = false;
    },
    setFilters: (state, action) => {
      const newFilters = {
        ...state.filters,
        ...action.payload
      };

      newFilters.page = action.payload.page !== undefined ?
        Math.max(1, parseInt(action.payload.page) || 1) :
        state.filters.page;

      state.filters = newFilters;
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        role: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 10
      };
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getAllUsersAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getAllUsersAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload.data?.users || [];
        if (action.payload.data?.pagination) {
          state.pagination = action.payload.data.pagination;
        }
      })
      .addCase(getAllUsersAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.users = [];
      })
      // Get user by ID
      .addCase(getUserByIdAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getUserByIdAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentUser = action.payload.data?.user || action.payload?.user;
      })
      .addCase(getUserByIdAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.currentUser = null;
      })
      // Update user
      .addCase(updateUserAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(updateUserAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updatedUser = action.payload.data?.user;
        const index = state.users.findIndex(u => u._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        state.currentUser = updatedUser;
        state.message = 'Cập nhật người dùng thành công';
      })
      .addCase(updateUserAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete user
      .addCase(deleteUserAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(deleteUserAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = state.users.filter(u => u._id !== action.payload);
        state.currentUser = null;
        state.message = 'Xóa người dùng thành công';
      })
      .addCase(deleteUserAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, setError, setFilters, clearFilters, clearCurrentUser } = adminUserSlice.actions;
export default adminUserSlice.reducer;
