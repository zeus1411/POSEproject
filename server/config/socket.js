import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat.js';

let io = null;

// Map để theo dõi user online và socket của họ
const onlineUsers = new Map(); // customerId -> socketId
const adminSockets = new Map(); // adminId -> socketId

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL,
        'http://localhost:5173', // Vite dev server
        'http://localhost', // Production nginx
        'http://localhost:80' // Production nginx explicit
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware xác thực
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.error('❌ Socket auth failed: No token provided');
        return next(new Error('Authentication error: No token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      
      console.log(`✅ Socket authenticated: ${socket.userId} (${socket.userRole})`);
      next();
    } catch (error) {
      console.error('❌ Socket auth error:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} (${socket.userRole})`);

    // Đăng ký user vào map
    if (socket.userRole === 'admin') {
      adminSockets.set(socket.userId, socket.id);
      console.log(`🔧 Admin ${socket.userId} online. Total admins: ${adminSockets.size}`);
      
      // Broadcast admin online status to other admins
      socket.broadcast.to('admins-room').emit('admin:online', { 
        adminId: socket.userId,
        totalAdmins: adminSockets.size
      });
      
      // Join admins room
      socket.join('admins-room');
    } else {
      onlineUsers.set(socket.userId, socket.id);
      console.log(`👤 Customer ${socket.userId} online`);
      
      // 🔑 Notify ALL admins that customer is online
      socket.broadcast.to('admins-room').emit('customer:online', { 
        customerId: socket.userId 
      });
    }

    // Join user to their own room
    socket.join(`user:${socket.userId}`);

    // ==================== CUSTOMER EVENTS ====================

    // Customer joins chat room
    socket.on('chat:join', async (data) => {
      try {
        const { chatId } = data;
        socket.join(`chat:${chatId}`);
        console.log(`User ${socket.userId} joined chat ${chatId}`);

        // Load chat and send to user
        const chat = await Chat.findById(chatId)
          .populate('customerId', 'username email avatar')
          .populate('userId', 'username email avatar') // Backward compatibility
          .populate('assignedTo', 'username email avatar')
          .populate('adminId', 'username email avatar') // Backward compatibility
          .populate('messages.senderId', 'username avatar role');

        socket.emit('chat:joined', { chat });

        // 🔑 Notify ALL admins that customer opened chat
        socket.broadcast.to('admins-room').emit('customer:chat-opened', { 
          chatId, 
          customerId: socket.userId,
          assignedTo: chat.assignedTo || chat.adminId
        });
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Không thể tham gia chat' });
      }
    });

    // Customer sends message
    socket.on('chat:send-message', async (data) => {
      try {
        const { chatId, message } = data;

        const chat = await Chat.findById(chatId);
        if (!chat) {
          return socket.emit('error', { message: 'Chat không tồn tại' });
        }

        // Add message
        await chat.addMessage(socket.userId, socket.userRole, message);
        
        // Populate
        await chat.populate('customerId', 'username email avatar');
        await chat.populate('userId', 'username email avatar');
        await chat.populate('assignedTo', 'username email avatar');
        await chat.populate('adminId', 'username email avatar');
        await chat.populate('messages.senderId', 'username avatar role');

        const lastMessage = chat.messages[chat.messages.length - 1];
        
        // Broadcast to all users in chat room
        io.to(`chat:${chatId}`).emit('chat:new-message', { 
          chat,
          message: {
            ...lastMessage.toObject(),
            chatId: chatId
          }
        });

        // 🔑 CUSTOMER MESSAGE - Notify ALL admins
        if (socket.userRole === 'user') {
          const assignedAdminId = chat.assignedTo || chat.adminId;
          
          // Broadcast to ALL admins in admins room
          socket.broadcast.to('admins-room').emit('chat:new-message-notification', {
            chatId,
            customerId: socket.userId,
            message,
            unreadCount: chat.unreadCount.admins,
            isNewChat: !assignedAdminId, // Flag if unassigned
            assignedTo: assignedAdminId,
            status: chat.status,
            priority: chat.priority
          });
          
          console.log(`📨 Customer message broadcasted to ALL admins. Chat: ${chatId}`);
        }

        // 🔑 ADMIN MESSAGE - Notify customer
        if (socket.userRole === 'admin') {
          const customerId = (chat.customerId || chat.userId)._id.toString();
          const customerSocketId = onlineUsers.get(customerId);
          
          if (customerSocketId) {
            io.to(customerSocketId).emit('chat:new-message-notification', {
              chatId,
              adminId: socket.userId,
              message,
              unreadCount: chat.unreadCount.customer
            });
          }
          
          // Also notify other admins about the update
          socket.broadcast.to('admins-room').emit('chat:updated', {
            chatId,
            chat
          });
        }

        console.log(`Message sent in chat ${chatId} by ${socket.userRole} ${socket.userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Không thể gửi tin nhắn' });
      }
    });

    // Mark messages as read
    socket.on('chat:mark-read', async (data) => {
      try {
        const { chatId } = data;

        const chat = await Chat.findById(chatId);
        if (!chat) {
          return socket.emit('error', { message: 'Chat không tồn tại' });
        }

        // Pass adminId for tracking
        const adminId = socket.userRole === 'admin' ? socket.userId : null;
        await chat.markAsRead(socket.userRole, adminId);

        // Notify the other party that messages were read
        io.to(`chat:${chatId}`).emit('chat:messages-read', { 
          chatId, 
          role: socket.userRole,
          adminId: adminId
        });

        console.log(`Messages marked as read in chat ${chatId} by ${socket.userRole}`);
      } catch (error) {
        console.error('Error marking as read:', error);
        socket.emit('error', { message: 'Không thể đánh dấu đã đọc' });
      }
    });

    // ==================== ADMIN EVENTS ====================

    // 🔑 Admin requests all chats (Shared Inbox)
    socket.on('admin:get-chats', async (filters = {}) => {
      try {
        if (socket.userRole !== 'admin') {
          return socket.emit('error', { message: 'Unauthorized' });
        }

        // Get ALL chats for shared inbox
        const chats = await Chat.find({ 
          status: { $in: ['UNASSIGNED', 'ASSIGNED', 'RESOLVED'] } 
        })
          .populate('customerId', 'username email avatar')
          .populate('userId', 'username email avatar')
          .populate('assignedTo', 'username email avatar')
          .populate('adminId', 'username email avatar')
          .populate('messages.senderId', 'username avatar role')
          .sort('-lastMessageAt');

        socket.emit('admin:chats-list', { chats });
        
        console.log(`📋 Admin ${socket.userId} requested chat list: ${chats.length} chats`);
      } catch (error) {
        console.error('Error getting admin chats:', error);
        socket.emit('error', { message: 'Không thể tải danh sách chat' });
      }
    });

    // 🔑 Admin assigns themselves to a chat
    socket.on('admin:assign-chat', async (data) => {
      try {
        if (socket.userRole !== 'admin') {
          return socket.emit('error', { message: 'Unauthorized' });
        }

        const { chatId } = data;
        const chat = await Chat.assignAdmin(chatId, socket.userId);

        // Join chat room
        socket.join(`chat:${chatId}`);

        // Notify customer
        const customerId = (chat.customerId || chat.userId)._id.toString();
        const customerSocketId = onlineUsers.get(customerId);
        if (customerSocketId) {
          io.to(customerSocketId).emit('chat:admin-assigned', { 
            chatId, 
            admin: chat.assignedTo || chat.adminId
          });
        }

        // 🔑 Notify ALL admins about assignment
        io.to('admins-room').emit('admin:chat-assigned', { 
          chatId,
          chat,
          assignedTo: socket.userId
        });

        console.log(`✅ Admin ${socket.userId} assigned to chat ${chatId}`);
      } catch (error) {
        console.error('Error assigning admin:', error);
        socket.emit('error', { message: 'Không thể nhận chat' });
      }
    });

    // 🔑 Admin takes over chat from another admin
    socket.on('admin:takeover-chat', async (data) => {
      try {
        if (socket.userRole !== 'admin') {
          return socket.emit('error', { message: 'Unauthorized' });
        }

        const { chatId } = data;
        const chat = await Chat.takeOverChat(chatId, socket.userId);

        // Join chat room
        socket.join(`chat:${chatId}`);

        // Notify customer
        const customerId = (chat.customerId || chat.userId)._id.toString();
        const customerSocketId = onlineUsers.get(customerId);
        if (customerSocketId) {
          io.to(customerSocketId).emit('chat:admin-changed', { 
            chatId, 
            newAdmin: chat.assignedTo || chat.adminId
          });
        }

        // 🔑 Notify ALL admins about takeover
        io.to('admins-room').emit('admin:chat-taken-over', { 
          chatId,
          chat,
          newAssignedTo: socket.userId
        });

        console.log(`🔄 Admin ${socket.userId} took over chat ${chatId}`);
      } catch (error) {
        console.error('Error taking over chat:', error);
        socket.emit('error', { message: 'Không thể tiếp quản chat' });
      }
    });

    // 🔑 Admin unassigns chat (returns to pool)
    socket.on('admin:unassign-chat', async (data) => {
      try {
        if (socket.userRole !== 'admin') {
          return socket.emit('error', { message: 'Unauthorized' });
        }

        const { chatId } = data;
        const chat = await Chat.unassignChat(chatId);

        // 🔑 Notify ALL admins that chat is back in pool
        io.to('admins-room').emit('admin:chat-unassigned', { 
          chatId,
          chat
        });

        console.log(`↩️ Chat ${chatId} returned to pool by admin ${socket.userId}`);
      } catch (error) {
        console.error('Error unassigning chat:', error);
        socket.emit('error', { message: 'Không thể trả chat về pool' });
      }
    });

    // Admin/Customer is typing
    socket.on('chat:typing', (data) => {
      const { chatId, isTyping } = data;
      socket.to(`chat:${chatId}`).emit('chat:user-typing', {
        userId: socket.userId,
        role: socket.userRole,
        isTyping
      });
    });

    // ==================== DISCONNECT ====================

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId} (${socket.userRole})`);

      if (socket.userRole === 'admin') {
        adminSockets.delete(socket.userId);
        
        // Broadcast admin offline status
        socket.broadcast.to('admins-room').emit('admin:offline', { 
          adminId: socket.userId,
          totalAdmins: adminSockets.size
        });
        
        console.log(`🔧 Admin offline. Remaining: ${adminSockets.size}`);
      } else {
        onlineUsers.delete(socket.userId);
        
        // Notify admins that customer is offline
        socket.broadcast.to('admins-room').emit('customer:offline', { 
          customerId: socket.userId 
        });
      }
    });
  });

  console.log('✅ Socket.IO initialized with Shared Inbox support');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitToUser = (userId, event, data) => {
  const socketId = onlineUsers.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};

export const emitToAdmin = (adminId, event, data) => {
  const socketId = adminSockets.get(adminId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};

// 🔑 Broadcast to ALL admins
export const emitToAllAdmins = (event, data) => {
  if (io) {
    io.to('admins-room').emit(event, data);
    console.log(`📢 Broadcasted to ALL admins: ${event}`);
  }
};

// 🔑 Get online admins count
export const getOnlineAdminsCount = () => {
  return adminSockets.size;
};

// 🔑 Get online customers count
export const getOnlineCustomersCount = () => {
  return onlineUsers.size;
};

// 🎁 Broadcast promotion to all connected users (customers)
export const broadcastPromotionToCustomers = (promotion) => {
  if (!io) {
    console.error('❌ Socket.io not initialized');
    return;
  }

  // Emit to all connected sockets except admins
  io.emit('promotion:created', { promotion });
  console.log(`🎉 Broadcasted promotion "${promotion.name}" to all users`);
};
