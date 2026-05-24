import Notification from '../models/Notification.js';
import Blog from '../../server-blogs/models/Blog.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../../utils/errorHandler.js';

const normalizeBlogNotificationUrls = async (notifications) => {
  const blogNotifications = notifications.filter(notification =>
    notification.type === 'BLOG_STATUS_UPDATE' &&
    notification.relatedType === 'blog' &&
    notification.actionUrl?.startsWith('/blogs/slug/')
  );

  if (blogNotifications.length === 0) {
    return notifications;
  }

  const blogIds = blogNotifications.map(notification => notification.relatedId).filter(Boolean);
  const blogs = await Blog.find({ _id: { $in: blogIds } }).select('slug').lean();
  const slugById = new Map(blogs.map(blog => [blog._id.toString(), blog.slug]));

  return notifications.map(notification => {
    const normalizedNotification = notification.toObject();
    const slug = normalizedNotification.relatedId
      ? slugById.get(normalizedNotification.relatedId.toString())
      : null;

    if (slug && normalizedNotification.actionUrl?.startsWith('/blogs/slug/')) {
      normalizedNotification.actionUrl = `/blogs/${slug}`;
    }

    return normalizedNotification;
  });
};

const getUserNotifications = async (req, res) => {
  const userId = req.user.userId;
  const { isRead, type, page = 1, limit = 20 } = req.query;

  const notifications = await Notification.getUserNotifications(userId, {
    isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
    type,
    page: parseInt(page),
    limit: parseInt(limit)
  });
  const normalizedNotifications = await normalizeBlogNotificationUrls(notifications);
  
  const total = await Notification.countDocuments({
    userId,
    ...(isRead !== undefined && { isRead: isRead === 'true' }),
    ...(type && { type })
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      notifications: normalizedNotifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
};

const getUnreadCount = async (req, res) => {
  const userId = req.user.userId;

  const count = await Notification.getUnreadCount(userId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: { count }
  });
};

const markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const notification = await Notification.findOne({ _id: id, userId });

  if (!notification) {
    throw new NotFoundError('Không tìm thấy thông báo');
  }

  await notification.markAsRead();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã đánh dấu thông báo là đã đọc',
    data: { notification }
  });
};

const markAllAsRead = async (req, res) => {
  const userId = req.user.userId;

  await Notification.markAllAsRead(userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã đánh dấu tất cả thông báo là đã đọc'
  });
};

export {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};

