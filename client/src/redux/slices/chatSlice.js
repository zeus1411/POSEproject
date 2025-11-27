import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  currentChat: null,
  chats: [], // For admin: list of all chats
  messages: [],
  unreadCount: 0,
  isLoading: false,
  isError: false,
  error: null,
  isConnected: false,
  onlineUsers: [], // For admin: list of online users
};

// Async thunks

// Get or create user chat
export const getUserChat = createAsyncThunk(
  'chat/getUserChat',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chat/user');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải chat');
    }
  }
);

// Get admin chats
export const getAdminChats = createAsyncThunk(
  'chat/getAdminChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chat/admin');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách chat');
    }
  }
);

// Get chat by ID
export const getChatById = createAsyncThunk(
  'chat/getChatById',
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/${chatId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải chat');
    }
  }
);

// Send message (HTTP fallback)
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/chat/${chatId}/message`, { message });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể gửi tin nhắn');
    }
  }
);

// Mark as read
export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/chat/${chatId}/read`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể đánh dấu đã đọc');
    }
  }
);

// Assign admin to chat
export const assignAdmin = createAsyncThunk(
  'chat/assignAdmin',
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/chat/${chatId}/assign`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể nhận chat');
    }
  }
);

// Get unread count
export const getUnreadCount = createAsyncThunk(
  'chat/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chat/unread-count');
      return response.data.data.unreadCount;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải số tin nhắn chưa đọc');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
      if (action.payload) {
        state.messages = action.payload.messages || [];
      }
    },
    addMessage: (state, action) => {
      const message = action.payload;
      
      console.log('🔄 Redux addMessage:', message);
      console.log('🔄 Message chatId:', message.chatId);
      
      // Add to messages array
      if (!state.messages.find(m => m._id === message._id)) {
        state.messages.push(message);
      }
      
      // Update current chat
      if (state.currentChat && state.currentChat._id === message.chatId) {
        if (!state.currentChat.messages.find(m => m._id === message._id)) {
          state.currentChat.messages.push(message);
        }
      }
      
      // Update chat in admin list
      const chatIndex = state.chats.findIndex(c => c._id === message.chatId);
      console.log('🔄 Chat index:', chatIndex, 'Total chats:', state.chats.length);
      
      if (chatIndex !== -1) {
        const targetChat = state.chats[chatIndex];
        console.log('🔄 Target chat messages before:', targetChat.messages.length);
        
        if (!targetChat.messages.find(m => m._id === message._id)) {
          targetChat.messages.push(message);
          console.log('✅ Message added! Messages after:', targetChat.messages.length);
        }
        targetChat.lastMessageAt = message.createdAt;
        
        // Move to top
        const chat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(chat);
      } else {
        console.log('❌ Chat not found in chats array!');
      }
    },
    updateChatInList: (state, action) => {
      const updatedChat = action.payload;
      const index = state.chats.findIndex(c => c._id === updatedChat._id);
      
      if (index !== -1) {
        state.chats[index] = updatedChat;
      } else {
        state.chats.unshift(updatedChat);
      }
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    markChatAsRead: (state, action) => {
      const chatId = action.payload;
      
      if (state.currentChat && state.currentChat._id === chatId) {
        state.currentChat.messages.forEach(msg => {
          msg.isRead = true;
        });
      }
      
      const chat = state.chats.find(c => c._id === chatId);
      if (chat) {
        chat.messages.forEach(msg => {
          msg.isRead = true;
        });
        chat.unreadCount = { user: 0, admin: 0 };
      }
    },
    setUserOnline: (state, action) => {
      const userId = action.payload;
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
    },
    setUserOffline: (state, action) => {
      const userId = action.payload;
      state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
    },
    resetChat: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get user chat
      .addCase(getUserChat.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getUserChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentChat = action.payload;
        state.messages = action.payload.messages || [];
      })
      .addCase(getUserChat.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })
      
      // Get admin chats
      .addCase(getAdminChats.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getAdminChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats = action.payload;
      })
      .addCase(getAdminChats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })
      
      // Get chat by ID
      .addCase(getChatById.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getChatById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentChat = action.payload;
        state.messages = action.payload.messages || [];
      })
      .addCase(getChatById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload;
      })
      
      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.currentChat = action.payload;
        state.messages = action.payload.messages || [];
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.currentChat = action.payload;
      })
      
      // Assign admin
      .addCase(assignAdmin.fulfilled, (state, action) => {
        const updatedChat = action.payload;
        const index = state.chats.findIndex(c => c._id === updatedChat._id);
        if (index !== -1) {
          state.chats[index] = updatedChat;
        }
      })
      
      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const {
  setConnected,
  setCurrentChat,
  addMessage,
  updateChatInList,
  incrementUnreadCount,
  setUnreadCount,
  markChatAsRead,
  setUserOnline,
  setUserOffline,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;
