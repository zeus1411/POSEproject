import express from 'express';
import {
  getCategories,
  getCategoryTree,
  getRootCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus
} from '../controllers/categoryController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/root', getRootCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', authenticateUser, authorizeRoles('admin'), createCategory);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateCategory);
router.patch('/:id/status', authenticateUser, authorizeRoles('admin'), updateCategoryStatus);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteCategory);

export default router;
