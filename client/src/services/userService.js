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
  if (response.data.success && response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
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
  if (response.data.success && response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

// Đổi mật khẩu
const changePassword = async (data) => {
  const response = await api.patch('/users/change-password', data);
  return response.data;
};

const userService = {
  getCurrentUser,
  updateProfile,
  updateAvatar,
  changePassword
};

export default userService;