import api from './api';

export const notificationService = {
  // Lấy danh sách thông báo
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Đánh dấu một thông báo là đã đọc
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Đánh dấu tất cả là đã đọc
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  }
};

export default notificationService;
