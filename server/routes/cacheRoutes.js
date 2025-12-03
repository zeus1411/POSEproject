import express from 'express';
import {
  getAllKeys,
  getKeyValue,
  deleteKey,
  deletePattern,
  flushAll,
  getCacheStats
} from '../controllers/cacheController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Lấy thống kê cache (dễ nhìn nhất)
router.get('/stats', authenticateUser, authorizeRoles('admin'), getCacheStats);

// Lấy tất cả keys
router.get('/keys', authenticateUser, authorizeRoles('admin'), getAllKeys);

// Xem giá trị của 1 key
router.get('/key/:key', authenticateUser, authorizeRoles('admin'), getKeyValue);

// Xóa 1 key
router.delete('/key/:key', authenticateUser, authorizeRoles('admin'), deleteKey);

// Xóa theo pattern
router.delete('/pattern/:pattern', authenticateUser, authorizeRoles('admin'), deletePattern);

// Xóa toàn bộ cache (NGUY HIỂM!)
router.delete('/flush', authenticateUser, authorizeRoles('admin'), flushAll);

export default router;
