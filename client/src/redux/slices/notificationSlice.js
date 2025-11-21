import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải thông báo');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount();
      return response.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải số lượng thông báo');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể đánh dấu đã đọc');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể đánh dấu tất cả đã đọc');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa thông báo');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    },
    isLoading: false,
    error: null
  },
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      };
    },
    // Optimistic update for unread count
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          if (state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
      })

      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        });
        state.unreadCount = 0;
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && !notification.isRead && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
        state.notifications = state.notifications.filter(n => n._id !== notificationId);
        state.pagination.total -= 1;
      });
  }
});

export const { clearNotifications, decrementUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
