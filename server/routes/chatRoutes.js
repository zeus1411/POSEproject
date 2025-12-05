import express from 'express';
import { 
  getUserChat, 
  getAdminChats, 
  getChatById, 
  sendMessage, 
  markAsRead, 
  assignAdmin,
  takeOverChat,
  unassignChat,
  getUnreadCount,
  deleteChat
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
router.delete('/:chatId', authorizeRoles('admin'), deleteChat);

// Shared routes (both user and admin)
router.get('/:chatId', getChatById);
router.post('/:chatId/message', sendMessage);
router.put('/:chatId/read', markAsRead);

// Admin only routes - Chat management
router.put('/:chatId/assign', authorizeRoles('admin'), assignAdmin);
router.put('/:chatId/takeover', authorizeRoles('admin'), takeOverChat);
router.put('/:chatId/unassign', authorizeRoles('admin'), unassignChat);

export default router;
