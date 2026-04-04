import api from './api';

// Lấy thông tin user hiện tại
const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Cập nhật profile (personal info + address)
const updateProfile = async (data) => {
  const response = await api.patch('/users/profile', data);
  
  // Update user in localStorage if the request was successful
  if (response.data.success && response.data.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

// Cập nhật username (dedicated endpoint)
const updateUsername = async (newUsername) => {
  const response = await api.patch('/users/profile', { username: newUsername });
  
  // Update user in localStorage if the request was successful
  if (response.data.success && response.data.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

// Cập nhật avatar
const updateAvatar = async (formData) => {
  const response = await api.patch('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  // Update user in localStorage if the request was successful
  if (response.data.success && response.data.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

// Đổi mật khẩu
const changePassword = async (data) => {
  const response = await api.patch('/users/change-password', data);
  return response.data;
};

// ========== ADMIN FUNCTIONS ==========

// Lấy danh sách người dùng (Admin)
const getAllUsersAdmin = async (params = {}) => {
  const queryParams = new URLSearchParams({
    page: params.page || 1,
    limit: params.limit || 10,
    ...(params.search && { search: params.search }),
    ...(params.role && { role: params.role }),
    ...(params.isActive !== '' && params.isActive !== undefined && { isActive: params.isActive }),
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.sortOrder && { sortOrder: params.sortOrder })
  });

  const response = await api.get(`/users/admin?${queryParams}`);
  return response.data;
};

// Lấy chi tiết người dùng (Admin)
const getUserByIdAdmin = async (userId) => {
  const response = await api.get(`/users/admin/${userId}`);
  return response.data;
};

// Cập nhật người dùng (Admin)
const updateUserByAdmin = async (userId, formData) => {
  const response = await api.put(`/users/admin/${userId}`, formData);
  return response.data;
};

// Xóa người dùng (Admin)
const deleteUserByAdmin = async (userId) => {
  const response = await api.delete(`/users/admin/${userId}`);
  return response.data;
};

const userService = {
  getCurrentUser,
  updateProfile,
  updateUsername,
  updateAvatar,
  changePassword,
  // Admin functions
  getAllUsersAdmin,
  getUserByIdAdmin,
  updateUserByAdmin,
  deleteUserByAdmin
};

export default userService;