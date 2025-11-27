import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat.js';

let io = null;

// Map để theo dõi user online và socket của họ
const onlineUsers = new Map(); // userId -> socketId
const adminSockets = new Map(); // adminId -> socketId

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
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
      socket.userId = decoded.userId; // ✅ Fixed: was decoded.id, should be decoded.userId
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
      console.log(`🔧 Admin ${socket.userId} online`);
      
      // Broadcast admin online status to other admins
      socket.broadcast.emit('admin:online', { adminId: socket.userId });
    } else {
      onlineUsers.set(socket.userId, socket.id);
      console.log(`👤 User ${socket.userId} online`);
      
      // Notify all admins that user is online
      adminSockets.forEach((adminSocketId) => {
        io.to(adminSocketId).emit('user:online', { userId: socket.userId });
      });
    }

    // Join user to their own room
    socket.join(`user:${socket.userId}`);

    // ==================== USER EVENTS ====================

    // User joins chat room
    socket.on('chat:join', async (data) => {
      try {
        const { chatId } = data;
        socket.join(`chat:${chatId}`);
        console.log(`User ${socket.userId} joined chat ${chatId}`);

        // Load chat and send to user
        const chat = await Chat.findById(chatId)
          .populate('userId', 'username email avatar')
          .populate('adminId', 'username email avatar')
          .populate('messages.senderId', 'username avatar role');

        socket.emit('chat:joined', { chat });

        // Notify admin if they're online
        if (chat.adminId) {
          const adminSocketId = adminSockets.get(chat.adminId._id.toString());
          if (adminSocketId) {
            io.to(adminSocketId).emit('user:chat-opened', { 
              chatId, 
              userId: socket.userId 
            });
          }
        }
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Không thể tham gia chat' });
      }
    });

    // User sends message
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
        await chat.populate('userId', 'username email avatar');
        await chat.populate('adminId', 'username email avatar');
        await chat.populate('messages.senderId', 'username avatar role');

        const lastMessage = chat.messages[chat.messages.length - 1];
        
        // Broadcast to all users in chat room
        io.to(`chat:${chatId}`).emit('chat:new-message', { 
          chat,
          message: {
            ...lastMessage.toObject(),
            chatId: chatId // Add chatId to message
          }
        });

        // Notify admin if they're not in the chat room
        if (socket.userRole === 'user') {
          if (chat.adminId) {
            // Chat has assigned admin - notify that specific admin
            const adminSocketId = adminSockets.get(chat.adminId._id.toString());
            if (adminSocketId) {
              io.to(adminSocketId).emit('chat:new-message-notification', {
                chatId,
                userId: socket.userId,
                message,
                unreadCount: chat.unreadCount.admin
              });
            }
          } else {
            // New user chat without admin - notify ALL online admins
            console.log('🔔 New user message - broadcasting to all admins');
            adminSockets.forEach((socketId, adminId) => {
              io.to(socketId).emit('chat:new-message-notification', {
                chatId,
                userId: socket.userId,
                message,
                unreadCount: chat.unreadCount.admin,
                isNewChat: true // Flag to indicate this is a new chat
              });
            });
          }
        }

        // Notify user if admin sent message and user is not in chat room
        if (socket.userRole === 'admin') {
          const userSocketId = onlineUsers.get(chat.userId._id.toString());
          if (userSocketId) {
            io.to(userSocketId).emit('chat:new-message-notification', {
              chatId,
              adminId: socket.userId,
              message,
              unreadCount: chat.unreadCount.user
            });
          }
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

        await chat.markAsRead(socket.userRole);

        // Notify the other party that messages were read
        io.to(`chat:${chatId}`).emit('chat:messages-read', { 
          chatId, 
          role: socket.userRole 
        });

        console.log(`Messages marked as read in chat ${chatId} by ${socket.userRole}`);
      } catch (error) {
        console.error('Error marking as read:', error);
        socket.emit('error', { message: 'Không thể đánh dấu đã đọc' });
      }
    });

    // ==================== ADMIN EVENTS ====================

    // Admin requests all chats
    socket.on('admin:get-chats', async () => {
      try {
        if (socket.userRole !== 'admin') {
          return socket.emit('error', { message: 'Unauthorized' });
        }

        const chats = await Chat.find({ 
          status: { $in: ['ACTIVE', 'PENDING'] } 
        })
          .populate('userId', 'username email avatar')
          .populate('adminId', 'username email avatar')
          .populate('messages.senderId', 'username avatar role')
          .sort('-lastMessageAt');

        socket.emit('admin:chats-list', { chats });
      } catch (error) {
        console.error('Error getting admin chats:', error);
        socket.emit('error', { message: 'Không thể tải danh sách chat' });
      }
    });

    // Admin assigns themselves to a chat
    socket.on('admin:assign-chat', async (data) => {
      try {
        if (socket.userRole !== 'admin') {
          return socket.emit('error', { message: 'Unauthorized' });
        }

        const { chatId } = data;
        const chat = await Chat.assignAdmin(chatId, socket.userId);

        // Join chat room
        socket.join(`chat:${chatId}`);

        // Notify user
        const userSocketId = onlineUsers.get(chat.userId._id.toString());
        if (userSocketId) {
          io.to(userSocketId).emit('chat:admin-assigned', { 
            chatId, 
            admin: chat.adminId 
          });
        }

        // Notify all admins
        adminSockets.forEach((adminSocketId) => {
          io.to(adminSocketId).emit('admin:chat-assigned', { chat });
        });

        console.log(`Admin ${socket.userId} assigned to chat ${chatId}`);
      } catch (error) {
        console.error('Error assigning admin:', error);
        socket.emit('error', { message: 'Không thể nhận chat' });
      }
    });

    // Admin is typing
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
        socket.broadcast.emit('admin:offline', { adminId: socket.userId });
      } else {
        onlineUsers.delete(socket.userId);
        
        // Notify admins that user is offline
        adminSockets.forEach((adminSocketId) => {
          io.to(adminSocketId).emit('user:offline', { userId: socket.userId });
        });
      }
    });
  });

  console.log('✅ Socket.IO initialized');
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

export const emitToAllAdmins = (event, data) => {
  if (io) {
    adminSockets.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
};
