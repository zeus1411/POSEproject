import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Restore user from localStorage on app load
const getUserFromLocalStorage = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

const initialState = {
  user: getUserFromLocalStorage(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  message: '',
  // OTP Registration state
  otpSent: false,
  otpEmail: null,
  otpLoading: false,
  otpError: null,
};

// ==================== REGISTRATION WITH OTP ====================

export const sendRegistrationOTP = createAsyncThunk(
  'auth/sendRegistrationOTP',
  async ({ email, username, password }, { rejectWithValue }) => {
    try {
      const response = await authService.sendRegistrationOTP(email, username, password);
      return { ...response, email };
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể gửi OTP';
      return rejectWithValue(message);
    }
  }
);

export const resendRegistrationOTP = createAsyncThunk(
  'auth/resendRegistrationOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.resendRegistrationOTP(email);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể gửi lại OTP';
      return rejectWithValue(message);
    }
  }
);

export const verifyRegistrationOTP = createAsyncThunk(
  'auth/verifyRegistrationOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyRegistrationOTP(email, otp);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Xác thực OTP thất bại';
      return rejectWithValue(message);
    }
  }
);

// ==================== OLD ASYNC THUNKS ====================

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.login(userData);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      return rejectWithValue(message);
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (credential, { rejectWithValue }) => {
    try {
      const response = await authService.googleLogin(credential);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập Google thất bại';
      return rejectWithValue(message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      
      // ✅ DEBUG: Log response để xem cấu trúc
      console.log('🔍 getCurrentUser response:', response);
      console.log('🔍 response.data:', response.data);
      console.log('🔍 response.data.user:', response.data?.user);
      
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue({ user: null, silent: true });
      }
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy thông tin người dùng'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Đăng xuất thất bại'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.error = null;
      state.message = '';
      state.otpError = null;
    },
    resetOTP: (state) => {
      state.otpSent = false;
      state.otpEmail = null;
      state.otpLoading = false;
      state.otpError = null;
    },
    setError: (state, action) => {
      state.isError = true;
      state.message = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      // Also update localStorage to persist user data
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    clearUser: (state) => {
      state.user = null;
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload?.user || null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload?.user || null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // ✅ FIX: Backend trả về response.data.user (không có nested data)
        state.user = action.payload?.user || null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload?.user || null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        // Không set error cho 401 vì đây là trạng thái bình thường
        if (action.payload?.silent) {
          state.user = null;
          state.error = null;
        } else {
          state.error = action.payload;
        }
      })
      // Logout
      .addCase(logout.fulfilled, (state, action) => {
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      // ==================== REGISTRATION OTP ====================
      // Send Registration OTP
      .addCase(sendRegistrationOTP.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
        state.otpSent = false;
      })
      .addCase(sendRegistrationOTP.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpSent = true;
        state.otpEmail = action.payload.email;
        state.message = action.payload.message || 'OTP đã được gửi đến email của bạn';
      })
      .addCase(sendRegistrationOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload;
        state.otpSent = false;
      })
      // Resend Registration OTP
      .addCase(resendRegistrationOTP.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(resendRegistrationOTP.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.message = action.payload.message || 'OTP mới đã được gửi';
      })
      .addCase(resendRegistrationOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload;
      })
      // Verify Registration OTP
      .addCase(verifyRegistrationOTP.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.otpError = null;
      })
      .addCase(verifyRegistrationOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload?.user || null;
        state.otpSent = false;
        state.otpEmail = null;
      })
      .addCase(verifyRegistrationOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.otpError = action.payload;
      });
  },
});

export const { reset, resetOTP, setError, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;