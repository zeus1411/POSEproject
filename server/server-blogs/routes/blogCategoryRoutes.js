import express from 'express';
import {
    getAllBlogCategories,
    getBlogCategoryById,
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory
} from '../controllers/blogCategoryController.js';
import { authenticateUser, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogCategories);
router.get('/:id', getBlogCategoryById);

// Admin routes
router.post('/', authenticateUser, authorizeRoles('admin'), createBlogCategory);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateBlogCategory);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteBlogCategory);

export default router;

