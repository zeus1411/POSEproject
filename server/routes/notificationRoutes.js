import express from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

// Tất cả routes đều yêu cầu xác thực
router.use(authenticateUser);

// User routes
router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/mark-all-read', markAllAsRead);

export default router;
