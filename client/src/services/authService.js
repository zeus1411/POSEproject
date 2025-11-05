import api from './api';

// Register user
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.success && response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  if (response.data.success && response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Logout user
const logout = async () => {
  try {
    await api.get('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('user');
  }
};

// Get current user
const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Send OTP for password reset
const sendOTP = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// Resend OTP for password reset
const resendOTP = async (email) => {
  const response = await api.post('/auth/resend-otp', { email });
  return response.data;
};

// Reset password with OTP
const resetPassword = async (email, otp, newPassword, confirmPassword) => {
  const response = await api.post('/auth/reset-password', { 
    email, 
    otp, 
    newPassword,
    confirmPassword
  });
  
  // If reset is successful and user is auto-logged in, store user info
  if (response.data.success && response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  sendOTP,
  resendOTP,
  resetPassword
};

export default authService;