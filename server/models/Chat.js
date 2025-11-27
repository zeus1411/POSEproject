import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [2000, 'Tin nhắn không được vượt quá 2000 ký tự']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Null nghĩa là chưa có admin nào nhận chat này
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['ACTIVE', 'CLOSED', 'PENDING'],
    default: 'PENDING' // PENDING: User mới tạo, chưa có admin trả lời
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    user: { type: Number, default: 0 }, // Số tin nhắn chưa đọc của user
    admin: { type: Number, default: 0 } // Số tin nhắn chưa đọc của admin
  }
}, {
  timestamps: true
});

// Indexes for performance
chatSchema.index({ userId: 1, status: 1 });
chatSchema.index({ adminId: 1, status: 1 });
chatSchema.index({ lastMessageAt: -1 });

// Update lastMessageAt before saving
chatSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].createdAt;
  }
  next();
});

// Method to add message
chatSchema.methods.addMessage = async function(senderId, senderRole, message) {
  this.messages.push({
    senderId,
    senderRole,
    message,
    isRead: false
  });
  
  this.lastMessageAt = new Date();
  
  // Update unread count
  if (senderRole === 'admin') {
    this.unreadCount.user += 1;
  } else {
    this.unreadCount.admin += 1;
  }
  
  // Update status to ACTIVE if it was PENDING
  if (this.status === 'PENDING' && senderRole === 'admin') {
    this.status = 'ACTIVE';
  }
  
  await this.save();
  return this;
};

// Method to mark messages as read
chatSchema.methods.markAsRead = async function(role) {
  const now = new Date();
  
  this.messages.forEach(msg => {
    // Mark messages from the other role as read
    if (role === 'admin' && msg.senderRole === 'user' && !msg.isRead) {
      msg.isRead = true;
      msg.readAt = now;
    } else if (role === 'user' && msg.senderRole === 'admin' && !msg.isRead) {
      msg.isRead = true;
      msg.readAt = now;
    }
  });
  
  // Reset unread count for this role
  if (role === 'admin') {
    this.unreadCount.admin = 0;
  } else {
    this.unreadCount.user = 0;
  }
  
  await this.save();
  return this;
};

// Static method to get or create chat for user
chatSchema.statics.getOrCreateChat = async function(userId) {
  let chat = await this.findOne({ userId, status: { $ne: 'CLOSED' } })
    .populate('userId', 'username email avatar')
    .populate('adminId', 'username email avatar')
    .populate('messages.senderId', 'username avatar role');
  
  if (!chat) {
    chat = await this.create({ userId, messages: [], status: 'PENDING' });
    chat = await chat.populate('userId', 'username email avatar');
  }
  
  return chat;
};

// Static method to get all active chats for admin
chatSchema.statics.getAdminChats = async function(adminId = null) {
  const query = { status: { $in: ['ACTIVE', 'PENDING'] } };
  
  // If adminId provided, filter by admin's chats or unassigned chats
  if (adminId) {
    query.$or = [
      { adminId: adminId },
      { adminId: null, status: 'PENDING' }
    ];
  }
  
  const chats = await this.find(query)
    .populate('userId', 'username email avatar')
    .populate('adminId', 'username email avatar')
    .populate('messages.senderId', 'username avatar role')
    .sort('-lastMessageAt');
  
  return chats;
};

// Static method to assign admin to chat
chatSchema.statics.assignAdmin = async function(chatId, adminId) {
  const chat = await this.findByIdAndUpdate(
    chatId,
    { adminId, status: 'ACTIVE' },
    { new: true }
  )
    .populate('userId', 'username email avatar')
    .populate('adminId', 'username email avatar')
    .populate('messages.senderId', 'username avatar role');
  
  return chat;
};

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
