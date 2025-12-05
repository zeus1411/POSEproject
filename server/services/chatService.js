import Chat from '../models/Chat.js';
import User from '../models/User.js';

class ChatService {
  // 🔑 Get or create chat for customer
  async getOrCreateChat(customerId) {
    const user = await User.findById(customerId);
    if (!user) {
      throw new Error('User không tồn tại');
    }

    const chat = await Chat.getOrCreateChat(customerId);
    return chat;
  }

  // Get chat by ID
  async getChatById(chatId, userId, role) {
    const chat = await Chat.findById(chatId)
      .populate('customerId', 'username email avatar')
      .populate('userId', 'username email avatar') // Backward compatibility
      .populate('assignedTo', 'username email avatar')
      .populate('adminId', 'username email avatar') // Backward compatibility
      .populate('messages.senderId', 'username avatar role');

    if (!chat) {
      throw new Error('Chat không tồn tại');
    }

    // Check permission
    const chatCustomerId = (chat.customerId || chat.userId)._id.toString();
    if (role === 'user' && chatCustomerId !== userId.toString()) {
      throw new Error('Bạn không có quyền truy cập chat này');
    }

    return chat;
  }

  // 🔑 Get ALL chats for admin (Shared Inbox - ALL admins see ALL chats)
  async getAllChatsForAdmin(options = {}) {
    // All admins can see all chats
    const chats = await Chat.getAllChatsForAdmin(options);
    return chats;
  }

  // 🔑 DEPRECATED - Keep for backward compatibility
  async getAdminChats(adminId = null) {
    // Return ALL chats regardless of adminId (Shared Inbox)
    return await this.getAllChatsForAdmin();
  }

  // Delete chat (admin only)
  async deleteChat(chatId, adminId) {
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      throw new Error('Chat không tồn tại');
    }

    await Chat.findByIdAndDelete(chatId);
    
    return { success: true, message: 'Đã xóa đoạn chat thành công' };
  }

  // Send message
  async sendMessage(chatId, senderId, senderRole, message) {
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      throw new Error('Chat không tồn tại');
    }

    // Verify sender
    const chatCustomerId = chat.customerId || chat.userId;
    if (senderRole === 'user' && chatCustomerId.toString() !== senderId.toString()) {
      throw new Error('Bạn không có quyền gửi tin nhắn trong chat này');
    }

    await chat.addMessage(senderId, senderRole, message);
    
    // Populate before returning
    await chat.populate('customerId', 'username email avatar');
    await chat.populate('userId', 'username email avatar'); // Backward compatibility
    await chat.populate('assignedTo', 'username email avatar');
    await chat.populate('adminId', 'username email avatar'); // Backward compatibility
    await chat.populate('messages.senderId', 'username avatar role');

    return chat;
  }

  // 🔑 Mark messages as read (with admin tracking)
  async markAsRead(chatId, userId, role) {
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      throw new Error('Chat không tồn tại');
    }

    // Verify permission
    const chatCustomerId = chat.customerId || chat.userId;
    if (role === 'user' && chatCustomerId.toString() !== userId.toString()) {
      throw new Error('Bạn không có quyền truy cập chat này');
    }

    // Pass adminId when admin is reading
    const adminId = role === 'admin' ? userId : null;
    await chat.markAsRead(role, adminId);
    
    // Populate before returning
    await chat.populate('customerId', 'username email avatar');
    await chat.populate('userId', 'username email avatar'); // Backward compatibility
    await chat.populate('assignedTo', 'username email avatar');
    await chat.populate('adminId', 'username email avatar'); // Backward compatibility
    await chat.populate('messages.senderId', 'username avatar role');

    return chat;
  }

  // 🔑 Assign admin to chat (or auto-assign)
  async assignAdmin(chatId, adminId) {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new Error('Admin không tồn tại');
    }

    const chat = await Chat.assignAdmin(chatId, adminId);
    return chat;
  }

  // 🔑 Take over chat (admin reassignment)
  async takeOverChat(chatId, newAdminId) {
    const admin = await User.findById(newAdminId);
    if (!admin || admin.role !== 'admin') {
      throw new Error('Admin không tồn tại');
    }

    const chat = await Chat.takeOverChat(chatId, newAdminId);
    return chat;
  }

  // 🔑 Unassign chat (return to pool)
  async unassignChat(chatId, adminId) {
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      throw new Error('Chat không tồn tại');
    }

    // Only assigned admin can unassign
    const assignedAdminId = chat.assignedTo || chat.adminId;
    if (assignedAdminId && assignedAdminId.toString() !== adminId.toString()) {
      throw new Error('Chỉ admin đang xử lý mới có thể bỏ nhận chat này');
    }

    return await Chat.unassignChat(chatId);
  }

  // 🔑 Resolve chat (mark as resolved but keep visible)
  async getUnreadCount(customerId) {
    const chat = await Chat.findOne({ 
      customerId, 
      status: { $nin: ['CLOSED'] } 
    });

    if (!chat) {
      return 0;
    }

    return chat.unreadCount.customer || 0;
  }

  // 🔑 Get total unread count for ALL admins (Shared Inbox)
  async getAdminUnreadCount(adminId = null) {
    // All admins see the same unread count (total from all chats)
    const chats = await Chat.find({ 
      status: { $in: ['UNASSIGNED', 'ASSIGNED', 'RESOLVED'] } 
    });
    
    const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount.admins || 0), 0);
    
    return totalUnread;
  }
}

export default new ChatService();
