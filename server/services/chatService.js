import Chat from '../models/Chat.js';
import User from '../models/User.js';

class ChatService {
  // Get or create chat for user
  async getOrCreateChat(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User không tồn tại');
    }

    const chat = await Chat.getOrCreateChat(userId);
    return chat;
  }

  // Get chat by ID
  async getChatById(chatId, userId, role) {
    const chat = await Chat.findById(chatId)
      .populate('userId', 'username email avatar')
      .populate('adminId', 'username email avatar')
      .populate('messages.senderId', 'username avatar role');

    if (!chat) {
      throw new Error('Chat không tồn tại');
    }

    // Check permission
    if (role === 'user' && chat.userId._id.toString() !== userId.toString()) {
      throw new Error('Bạn không có quyền truy cập chat này');
    }

    return chat;
  }

  // Get all chats for admin
  async getAdminChats(adminId = null) {
    const chats = await Chat.getAdminChats(adminId);
    return chats;
  }

  // Send message
  async sendMessage(chatId, senderId, senderRole, message) {
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      throw new Error('Chat không tồn tại');
    }

    // Verify sender
    if (senderRole === 'user' && chat.userId.toString() !== senderId.toString()) {
      throw new Error('Bạn không có quyền gửi tin nhắn trong chat này');
    }

    await chat.addMessage(senderId, senderRole, message);
    
    // Populate before returning
    await chat.populate('userId', 'username email avatar');
    await chat.populate('adminId', 'username email avatar');
    await chat.populate('messages.senderId', 'username avatar role');

    return chat;
  }

  // Mark messages as read
  async markAsRead(chatId, userId, role) {
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      throw new Error('Chat không tồn tại');
    }

    // Verify permission
    if (role === 'user' && chat.userId.toString() !== userId.toString()) {
      throw new Error('Bạn không có quyền truy cập chat này');
    }

    await chat.markAsRead(role);
    
    // Populate before returning
    await chat.populate('userId', 'username email avatar');
    await chat.populate('adminId', 'username email avatar');
    await chat.populate('messages.senderId', 'username avatar role');

    return chat;
  }

  // Assign admin to chat (auto-assign or manual)
  async assignAdmin(chatId, adminId) {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new Error('Admin không tồn tại');
    }

    const chat = await Chat.assignAdmin(chatId, adminId);
    return chat;
  }

  // Close chat
  async closeChat(chatId, userId, role) {
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      throw new Error('Chat không tồn tại');
    }

    // Only admin or chat owner can close
    if (role === 'user' && chat.userId.toString() !== userId.toString()) {
      throw new Error('Bạn không có quyền đóng chat này');
    }

    chat.status = 'CLOSED';
    await chat.save();

    return chat;
  }

  // Get unread count for user
  async getUnreadCount(userId) {
    const chat = await Chat.findOne({ 
      userId, 
      status: { $ne: 'CLOSED' } 
    });

    if (!chat) {
      return 0;
    }

    return chat.unreadCount.user || 0;
  }

  // Get total unread count for admin (all chats)
  async getAdminUnreadCount(adminId = null) {
    const query = { status: { $in: ['ACTIVE', 'PENDING'] } };
    
    if (adminId) {
      query.$or = [
        { adminId: adminId },
        { adminId: null, status: 'PENDING' }
      ];
    }

    const chats = await Chat.find(query);
    const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount.admin || 0), 0);
    
    return totalUnread;
  }
}

export default new ChatService();
