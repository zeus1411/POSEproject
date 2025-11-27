import express from 'express';
import { 
  getUserChat, 
  getAdminChats, 
  getChatById, 
  sendMessage, 
  markAsRead, 
  assignAdmin, 
  closeChat,
  getUnreadCount 
} from '../controllers/chatController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// User routes
router.get('/user', getUserChat);
router.get('/unread-count', getUnreadCount);

// Admin routes
router.get('/admin', authorizeRoles('admin'), getAdminChats);

// Shared routes (both user and admin)
router.get('/:chatId', getChatById);
router.post('/:chatId/message', sendMessage);
router.put('/:chatId/read', markAsRead);
router.put('/:chatId/close', closeChat);

// Admin only routes
router.put('/:chatId/assign', authorizeRoles('admin'), assignAdmin);

export default router;
