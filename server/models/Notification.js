import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'ORDER_UPDATE',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'PROMOTION',
        'PRODUCT_REVIEW',
        'SYSTEM_ANNOUNCEMENT',
        'WELCOME',
        'PASSWORD_RESET'
      ],
      required: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Nội dung không được vượt quá 1000 ký tự']
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedType'
    },
    relatedType: {
      type: String,
      enum: ['order', 'payment', 'product', 'promotion', 'blog', 'system']
    },
    actionUrl: String,
    actionText: String,
    icon: String,
    channels: [
      {
        type: String,
        enum: ['IN_APP', 'EMAIL', 'SMS', 'PUSH'],
        default: 'IN_APP'
      }
    ],
    emailData: {
      subject: String,
      templateName: String,
      templateData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
      }
    },
    emailSent: {
      type: Boolean,
      default: false
    },
    emailSentAt: Date,
    emailError: String,
    smsData: {
      phoneNumber: String,
      message: String
    },
    smsSent: {
      type: Boolean,
      default: false
    },
    smsSentAt: Date,
    smsError: String,
    pushData: {
      title: String,
      body: String,
      data: {
        type: Map,
        of: String
      }
    },
    pushSent: {
      type: Boolean,
      default: false
    },
    pushSentAt: Date,
    pushError: String,
    expiresAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ createdAt: -1 });

// Mark as read
notificationSchema.methods.markAsRead = async function () {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
  
  return this;
};

// Mark as unread
notificationSchema.methods.markAsUnread = async function () {
  if (this.isRead) {
    this.isRead = false;
    this.readAt = null;
    await this.save();
  }
  
  return this;
};

// Send email notification
notificationSchema.methods.sendEmail = async function () {
  if (!this.channels.includes('EMAIL') || this.emailSent) {
    return;
  }
  
  try {
    // Email sending logic will be implemented in service layer
    // This is just a placeholder to mark email as sent
    this.emailSent = true;
    this.emailSentAt = new Date();
    await this.save();
    
    return true;
  } catch (error) {
    this.emailError = error.message;
    await this.save();
    return false;
  }
};

// Static method to create notification
notificationSchema.statics.createNotification = async function (data) {
  const notification = await this.create(data);
  
  // Send notifications through configured channels
  if (notification.channels.includes('EMAIL')) {
    await notification.sendEmail();
  }
  
  // Additional channel sending logic can be added here
  
  return notification;
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function (userId, options = {}) {
  const { 
    isRead, 
    type, 
    limit = 20, 
    page = 1 
  } = options;
  
  const query = { userId };
  
  if (typeof isRead !== 'undefined') {
    query.isRead = isRead;
  }
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .sort('-createdAt')
    .limit(limit)
    .skip((page - 1) * limit);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({ userId, isRead: false });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function (userId) {
  const result = await this.updateMany(
    { userId, isRead: false },
    { 
      isRead: true,
      readAt: new Date()
    }
  );
  
  return result;
};

// Static method to delete old notifications
notificationSchema.statics.deleteOldNotifications = async function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
  
  return result;
};

// Static method to create order notification
notificationSchema.statics.createOrderNotification = async function (userId, orderId, status, message) {
  const titles = {
    CONFIRMED: 'Đơn hàng đã được xác nhận',
    PROCESSING: 'Đơn hàng đang được xử lý',
    SHIPPING: 'Đơn hàng đang được giao',
    COMPLETED: 'Đơn hàng đã giao thành công',
    CANCELLED: 'Đơn hàng đã bị hủy',
    REFUNDED: 'Đơn hàng đã được hoàn tiền'
  };
  
  return this.createNotification({
    userId,
    type: 'ORDER_UPDATE',
    priority: ['CANCELLED', 'REFUNDED'].includes(status) ? 'HIGH' : 'MEDIUM',
    title: titles[status] || 'Cập nhật đơn hàng',
    message,
    relatedId: orderId,
    relatedType: 'order',
    actionUrl: `/orders/${orderId}`,
    actionText: 'Xem chi tiết',
    channels: ['IN_APP', 'EMAIL'],
    emailData: {
      subject: titles[status] || 'Cập nhật đơn hàng',
      templateName: `order-${status.toLowerCase()}`,
      templateData: new Map([['orderId', orderId.toString()]])
    }
  });
};

// Static method to create payment notification
notificationSchema.statics.createPaymentNotification = async function (userId, orderId, paymentStatus, message) {
  const isSuccess = paymentStatus === 'COMPLETED';
  
  return this.createNotification({
    userId,
    type: isSuccess ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
    priority: isSuccess ? 'MEDIUM' : 'HIGH',
    title: isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại',
    message,
    relatedId: orderId,
    relatedType: 'payment',
    actionUrl: `/orders/${orderId}`,
    actionText: isSuccess ? 'Xem đơn hàng' : 'Thử lại',
    channels: ['IN_APP', 'EMAIL']
  });
};

// Static method to create promotion notification
notificationSchema.statics.createPromotionNotification = async function (userId, promotionId, title, message) {
  return this.createNotification({
    userId,
    type: 'PROMOTION',
    priority: 'MEDIUM',
    title,
    message,
    relatedId: promotionId,
    relatedType: 'promotion',
    actionUrl: '/promotions',
    actionText: 'Xem khuyến mãi',
    channels: ['IN_APP', 'EMAIL'],
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;