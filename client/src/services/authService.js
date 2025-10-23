import api from './api';

// Register user
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.success && response.data.user) {
    // Server sets cookie, just store user info
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  if (response.data.success && response.data.user) {
    // Server sets cookie, just store user info
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
    // Clear local storage
    localStorage.removeItem('user');
  }
};

// Get current user
const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser
};

export default authService;
