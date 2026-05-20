import mongoose from 'mongoose';
import sendEmail from '../../utils/sendEmail.js';

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
        'PASSWORD_RESET',
        'NEW_ORDER_ADMIN',
        'BLOG_SUBMISSION_ADMIN',
        'BLOG_STATUS_UPDATE'
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
  // Không gửi nếu:
  // - Notification không có channel EMAIL
  // - Hoặc email đã được gửi trước đó
  if (!this.channels.includes('EMAIL') || this.emailSent) {
    return;
  }

  try {
    // Lấy thông tin user để biết email
    await this.populate('userId', 'email username fullName');

    const user = this.userId;
    const toEmail = user?.email;

    if (!toEmail) {
      throw new Error('Không tìm thấy email của người dùng để gửi thông báo');
    }

    // Subject ưu tiên lấy từ emailData, fallback về title
    const subject = this.emailData?.subject || this.title;
    const message = this.message;

    const displayName = user.fullName || user.username || 'bạn';

    // Link hành động (nếu có), ví dụ: /orders/:id
    const actionUrl = this.actionUrl
      ? `${process.env.CLIENT_URL}${this.actionUrl}`
      : process.env.CLIENT_URL;

    // HTML đơn giản (dùng chung cho mọi loại notification)
    const html = `
      <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
        <h2 style="color:#16a085; margin-bottom:16px;">${subject}</h2>
        <p>Xin chào ${displayName},</p>
        <p>${message}</p>

        ${
          this.relatedType === 'order'
            ? `
          <p>📦 Bạn có thể xem chi tiết đơn hàng tại đây:</p>
          <p>
            <a href="${actionUrl}"
               style="background:#16a085;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:8px;">
              Xem đơn hàng
            </a>
          </p>
        `
            : this.actionUrl
            ? `
          <p>
            <a href="${actionUrl}">Xem chi tiết</a>
          </p>
        `
            : ''
        }

        <hr style="margin-top:32px; border:none; border-top:1px solid #eee;" />
        <p style="font-size:12px; color:#999;">
          Email này được gửi tự động từ hệ thống Aquatic Store. Vui lòng không trả lời email này.
        </p>
      </div>
    `;

    // Gọi util nodemailer
    await sendEmail({
      email: toEmail,
      subject,
      message,
      html,
    });

    // Đánh dấu đã gửi
    this.emailSent = true;
    this.emailSentAt = new Date();
    await this.save();

    return true;
  } catch (error) {
    console.error('Error sending notification email:', error);
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
  
  console.log('📧 Email notification skipped (Gmail limit exceeded)');
  
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
notificationSchema.statics.createOrderNotification = async function (
  userId,
  orderId,
  status,
  message
) {
  const titles = {
    CONFIRMED: 'Đơn hàng đã được xác nhận',
    PROCESSING: 'Đơn hàng đang được xử lý',
    SHIPPING: 'Đơn hàng đang được giao',
    COMPLETED: 'Đơn hàng đã giao thành công',
    CANCELLED: 'Đơn hàng đã bị hủy'
  };

  const data = {
    userId,
    type: 'ORDER_UPDATE',
    priority: status === 'CANCELLED' ? 'HIGH' : 'MEDIUM',
    title: titles[status] || 'Cập nhật đơn hàng',
    message,
    relatedId: orderId,
    relatedType: 'order',
    actionUrl: `/orders/${orderId}`,
    actionText: 'Xem chi tiết',
    channels: ['IN_APP'], // Chỉ thông báo trong app, không gửi email
  };

  return this.createNotification(data);
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

// ✅ Static method to create new order notification for all admins
notificationSchema.statics.createNewOrderNotificationForAdmins = async function (orderId, orderNumber, customerName, totalPrice) {
  try {
    // Get all admin users
    const User = mongoose.model('User');
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      console.log('No admin users found to send notification');
      return [];
    }
    
    // Create notification for each admin
    const notifications = await Promise.all(
      admins.map(admin =>
        this.createNotification({
          userId: admin._id,
          type: 'NEW_ORDER_ADMIN',
          priority: 'HIGH',
          title: '🛒 Đơn hàng mới cần xác nhận',
          message: `Khách hàng ${customerName} vừa đặt đơn hàng #${orderNumber} với giá trị ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}. Vui lòng xác nhận đơn hàng.`,
          relatedId: orderId,
          relatedType: 'order',
          actionUrl: `/admin/orders/${orderId}`,
          actionText: 'Xem đơn hàng',
          icon: '🛒',
          channels: ['IN_APP']
        })
      )
    );
    
    console.log(`✅ Created ${notifications.length} admin notifications for new order ${orderNumber}`);
    return notifications;
  } catch (error) {
    console.error('Error creating admin notifications:', error);
    return [];
  }
};

// ✅ Static method to create new blog submission notification for all admins
notificationSchema.statics.createBlogSubmissionNotificationForAdmins = async function (blogId, blogTitle, authorName) {
  try {
    const User = mongoose.model('User');
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) return [];
    
    const notifications = await Promise.all(
      admins.map(admin =>
        this.createNotification({
          userId: admin._id,
          type: 'BLOG_SUBMISSION_ADMIN',
          priority: 'HIGH',
          title: '📝 Bài viết mới cần duyệt',
          message: `Tác giả ${authorName} vừa gửi bài viết "${blogTitle}" để duyệt.`,
          relatedId: blogId,
          relatedType: 'blog',
          actionUrl: '/admin/blogs/pending',
          actionText: 'Duyệt bài',
          icon: '📝',
          channels: ['IN_APP', 'EMAIL']
        })
      )
    );
    
    return notifications;
  } catch (error) {
    console.error('Error creating blog submission notifications:', error);
    return [];
  }
};

// ✅ Static method to notify user about blog status update
notificationSchema.statics.createBlogStatusNotificationForUser = async function (userId, blogId, blogTitle, status, reason) {
  try {
    const isPublished = status === 'PUBLISHED';
    
    const data = {
      userId,
      type: 'BLOG_STATUS_UPDATE',
      priority: isPublished ? 'MEDIUM' : 'HIGH',
      title: isPublished ? '✅ Bài viết đã được đăng' : '❌ Bài viết bị từ chối',
      message: isPublished 
        ? `Chúc mừng! Bài viết "${blogTitle}" của bạn đã được quản trị viên phê duyệt và đăng tải.`
        : `Bài viết "${blogTitle}" của bạn đã bị từ chối. Lý do: ${reason}. Vui lòng sửa lại và gửi duyệt lại.`,
      relatedId: blogId,
      relatedType: 'blog',
      actionUrl: isPublished ? `/blogs/slug/${blogId}` : `/me/blogs/edit/${blogId}`, // Simplified links
      actionText: 'Xem chi tiết',
      icon: isPublished ? '✅' : '❌',
      channels: ['IN_APP', 'EMAIL']
    };

    return await this.createNotification(data);
  } catch (error) {
    console.error('Error creating blog status notification:', error);
    return null;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
