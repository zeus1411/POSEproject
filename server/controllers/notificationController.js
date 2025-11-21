import Notification from '../models/Notification.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../utils/errorHandler.js';

// @desc    Lấy danh sách thông báo của user
// @route   GET /api/notifications
// @access  Private (User)
const getUserNotifications = async (req, res) => {
  const userId = req.user.userId;
  const { isRead, type, page = 1, limit = 20 } = req.query;

  const notifications = await Notification.getUserNotifications(userId, {
    isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
    type,
    page: parseInt(page),
    limit: parseInt(limit)
  });

  const total = await Notification.countDocuments({
    userId,
    ...(isRead !== undefined && { isRead: isRead === 'true' }),
    ...(type && { type })
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
};

// @desc    Lấy số lượng thông báo chưa đọc
// @route   GET /api/notifications/unread-count
// @access  Private (User)
const getUnreadCount = async (req, res) => {
  const userId = req.user.userId;
  const count = await Notification.getUnreadCount(userId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: { count }
  });
};

// @desc    Đánh dấu một thông báo là đã đọc
// @route   PATCH /api/notifications/:id/read
// @access  Private (User)
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

// @desc    Đánh dấu tất cả thông báo là đã đọc
// @route   PATCH /api/notifications/mark-all-read
// @access  Private (User)
const markAllAsRead = async (req, res) => {
  const userId = req.user.userId;

  await Notification.markAllAsRead(userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã đánh dấu tất cả thông báo là đã đọc'
  });
};

// @desc    Xóa một thông báo
// @route   DELETE /api/notifications/:id
// @access  Private (User)
const deleteNotification = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const notification = await Notification.findOneAndDelete({ _id: id, userId });

  if (!notification) {
    throw new NotFoundError('Không tìm thấy thông báo');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã xóa thông báo'
  });
};

export {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
