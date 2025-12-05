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
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  // 🔑 Customer ID - Required
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 🔑 Assigned Admin - Nullable (null = unassigned)
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  
  // 🔑 Assignment History - Track who handled this chat
  assignmentHistory: [{
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    unassignedAt: {
      type: Date
    }
  }],
  
  // 🔑 Status - Enhanced with more states
  status: {
    type: String,
    enum: ['UNASSIGNED', 'ASSIGNED', 'RESOLVED', 'CLOSED'],
    default: 'UNASSIGNED',
    index: true
  },
  
  // 🔑 Priority
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  
  // Messages
  messages: [messageSchema],
  
  // Timestamps
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // 🔑 Unread count per role
  unreadCount: {
    customer: { type: Number, default: 0 },
    admins: { type: Number, default: 0 } // All admins can see this
  },
  
  // 🔑 Tags for categorization
  tags: [String],
  
  // 🔑 Internal notes (only visible to admins)
  notes: {
    type: String,
    default: ''
  },
  
  // 🔑 Metadata
  metadata: {
    firstResponseTime: Date, // Time when first admin replied
    averageResponseTime: Number, // In seconds
    totalMessages: { type: Number, default: 0 },
    customerSatisfaction: Number // 1-5 rating
  },
  
  // DEPRECATED - Keep for backward compatibility
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
chatSchema.index({ customerId: 1, status: 1 });
chatSchema.index({ assignedTo: 1, status: 1 });
chatSchema.index({ status: 1, lastMessageAt: -1 });
chatSchema.index({ priority: 1, status: 1 });

// Sync old fields with new fields for backward compatibility
chatSchema.pre('save', function(next) {
  // Sync userId with customerId
  if (this.userId && !this.customerId) {
    this.customerId = this.userId;
  } else if (this.customerId && !this.userId) {
    this.userId = this.customerId;
  }
  
  // Sync adminId with assignedTo
  if (this.adminId && !this.assignedTo) {
    this.assignedTo = this.adminId;
  } else if (this.assignedTo && !this.adminId) {
    this.adminId = this.assignedTo;
  }
  
  // Update lastMessageAt
  if (this.messages && this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].createdAt;
  }
  
  // Update metadata
  this.metadata.totalMessages = this.messages.length;
  
  next();
});

// 🔑 Method to add message with enhanced tracking
chatSchema.methods.addMessage = async function(senderId, senderRole, message) {
  const newMessage = {
    senderId,
    senderRole,
    message,
    isRead: false,
    readBy: []
  };
  
  this.messages.push(newMessage);
  this.lastMessageAt = new Date();
  
  // Update unread count
  if (senderRole === 'admin') {
    this.unreadCount.customer += 1;
    
    // Track first response time
    if (!this.metadata.firstResponseTime) {
      this.metadata.firstResponseTime = new Date();
    }
  } else {
    this.unreadCount.admins += 1;
  }
  
  // Auto-assign status when admin first replies
  if (this.status === 'UNASSIGNED' && senderRole === 'admin' && this.assignedTo) {
    this.status = 'ASSIGNED';
  }
  
  await this.save();
  return this;
};

// 🔑 Method to mark messages as read (with multi-admin support)
chatSchema.methods.markAsRead = async function(role, adminId = null) {
  const now = new Date();
  const Chat = this.constructor;
  
  // ✅ Use atomic update to avoid version conflicts
  const updateQuery = {
    $set: {}
  };
  
  // Build atomic update for messages
  this.messages.forEach((msg, index) => {
    if (role === 'admin' && msg.senderRole === 'user' && !msg.isRead) {
      updateQuery.$set[`messages.${index}.isRead`] = true;
      updateQuery.$set[`messages.${index}.readAt`] = now;
      if (adminId && !msg.readBy.includes(adminId)) {
        if (!updateQuery.$addToSet) updateQuery.$addToSet = {};
        updateQuery.$addToSet[`messages.${index}.readBy`] = adminId;
      }
    } else if (role === 'user' && msg.senderRole === 'admin' && !msg.isRead) {
      updateQuery.$set[`messages.${index}.isRead`] = true;
      updateQuery.$set[`messages.${index}.readAt`] = now;
    }
  });
  
  // Reset unread count
  if (role === 'admin') {
    updateQuery.$set['unreadCount.admins'] = 0;
  } else {
    updateQuery.$set['unreadCount.customer'] = 0;
  }
  
  // ✅ Atomic update without version check
  const updatedChat = await Chat.findByIdAndUpdate(
    this._id,
    updateQuery,
    { new: true, runValidators: false }
  )
    .populate('customerId', 'username email avatar')
    .populate('assignedTo', 'username email avatar')
    .populate('messages.senderId', 'username avatar role');
  
  return updatedChat || this;
};

// 🔑 Static method to get or create chat for customer
chatSchema.statics.getOrCreateChat = async function(customerId) {
  let chat = await this.findOne({ 
    customerId, 
    status: { $nin: ['CLOSED'] } 
  })
    .populate('customerId', 'username email avatar')
    .populate('assignedTo', 'username email avatar')
    .populate('messages.senderId', 'username avatar role');
  
  if (!chat) {
    chat = await this.create({ 
      customerId,
      userId: customerId, // Backward compatibility
      messages: [], 
      status: 'UNASSIGNED' 
    });
    chat = await chat.populate('customerId', 'username email avatar');
  }
  
  return chat;
};

// 🔑 Static method to get ALL chats for admin dashboard (Shared Inbox)
chatSchema.statics.getAllChatsForAdmin = async function(options = {}) {
  const { 
    status,
    assignedTo, 
    priority,
    tags,
    limit = 100,
    skip = 0 
  } = options;
  
  const query = { 
    status: { $in: ['UNASSIGNED', 'ASSIGNED', 'RESOLVED'] } 
  };
  
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;
  if (priority) query.priority = priority;
  if (tags && tags.length > 0) query.tags = { $in: tags };
  
  const chats = await this.find(query)
    .populate('customerId', 'username email avatar')
    .populate('assignedTo', 'username email avatar')
    .populate('messages.senderId', 'username avatar role')
    .sort('-lastMessageAt')
    .limit(limit)
    .skip(skip);
  
  return chats;
};

// 🔑 Static method to assign admin to chat
chatSchema.statics.assignAdmin = async function(chatId, adminId) {
  const chat = await this.findById(chatId);
  
  if (!chat) {
    throw new Error('Chat không tồn tại');
  }
  
  // If chat was assigned to another admin, close that assignment
  if (chat.assignedTo && chat.assignedTo.toString() !== adminId.toString()) {
    // Update assignment history
    const currentAssignment = chat.assignmentHistory.find(
      h => h.adminId.toString() === chat.assignedTo.toString() && !h.unassignedAt
    );
    if (currentAssignment) {
      currentAssignment.unassignedAt = new Date();
    }
  }
  
  // Assign new admin
  chat.assignedTo = adminId;
  chat.adminId = adminId; // Backward compatibility
  chat.status = 'ASSIGNED';
  
  // Add to assignment history
  chat.assignmentHistory.push({
    adminId,
    assignedAt: new Date()
  });
  
  await chat.save();
  
  return await this.findById(chatId)
    .populate('customerId', 'username email avatar')
    .populate('assignedTo', 'username email avatar')
    .populate('messages.senderId', 'username avatar role');
};

// 🔑 Static method to take over a chat (admin reassignment)
chatSchema.statics.takeOverChat = async function(chatId, newAdminId) {
  return await this.assignAdmin(chatId, newAdminId);
};

// 🔑 Static method to unassign chat (return to pool)
chatSchema.statics.unassignChat = async function(chatId) {
  const chat = await this.findById(chatId);
  
  if (!chat) {
    throw new Error('Chat không tồn tại');
  }
  
  // Close current assignment
  if (chat.assignedTo) {
    const currentAssignment = chat.assignmentHistory.find(
      h => h.adminId.toString() === chat.assignedTo.toString() && !h.unassignedAt
    );
    if (currentAssignment) {
      currentAssignment.unassignedAt = new Date();
    }
  }
  
  chat.assignedTo = null;
  chat.adminId = null;
  chat.status = 'UNASSIGNED';
  
  await chat.save();
  
  return await this.findById(chatId)
    .populate('customerId', 'username email avatar')
    .populate('messages.senderId', 'username avatar role');
};

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
