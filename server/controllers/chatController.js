import chatService from '../services/chatService.js';
import { StatusCodes } from 'http-status-codes';

// @desc    Get or create chat for current user
// @route   GET /api/v1/chat/user
// @access  Private (User)
export const getUserChat = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const chat = await chatService.getOrCreateChat(userId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all chats for admin
// @route   GET /api/v1/chat/admin
// @access  Private (Admin)
export const getAdminChats = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const chats = await chatService.getAdminChats(adminId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: chats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat by ID
// @route   GET /api/v1/chat/:chatId
// @access  Private
export const getChatById = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const chat = await chatService.getChatById(chatId, userId, role);

    res.status(StatusCodes.OK).json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message
// @route   POST /api/v1/chat/:chatId/message
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const senderId = req.user.userId;
    const senderRole = req.user.role;

    if (!message || message.trim().length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Tin nhắn không được để trống'
      });
    }

    const chat = await chatService.sendMessage(chatId, senderId, senderRole, message);

    res.status(StatusCodes.OK).json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/v1/chat/:chatId/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const chat = await chatService.markAsRead(chatId, userId, role);

    res.status(StatusCodes.OK).json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign admin to chat
// @route   PUT /api/v1/chat/:chatId/assign
// @access  Private (Admin)
export const assignAdmin = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const adminId = req.user.userId;

    const chat = await chatService.assignAdmin(chatId, adminId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: chat,
      message: 'Đã nhận chat thành công'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close chat
// @route   PUT /api/v1/chat/:chatId/close
// @access  Private
export const closeChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const chat = await chatService.closeChat(chatId, userId, role);

    res.status(StatusCodes.OK).json({
      success: true,
      data: chat,
      message: 'Đã đóng chat'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread count
// @route   GET /api/v1/chat/unread-count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let unreadCount = 0;

    if (role === 'admin') {
      unreadCount = await chatService.getAdminUnreadCount(userId);
    } else {
      unreadCount = await chatService.getUnreadCount(userId);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    next(error);
  }
};
