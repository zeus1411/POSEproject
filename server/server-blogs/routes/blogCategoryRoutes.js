import express from 'express';
import {
    getAllBlogCategories,
    getBlogCategoryById,
    createBlogCategory,
    updateBlogCategory,
    updateCategoryStatus,
    deleteBlogCategory
} from '../controllers/blogCategoryController.js';
import { authenticateUser, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Blog Categories
 *   description: Blog Category management APIs
 */

/**
 * @swagger
 * /blog-categories/{id}/status:
 *   patch:
 *     summary: Update blog category status (Admin only)
 *     tags: [Blog Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', authenticateUser, authorizeRoles('admin'), updateCategoryStatus);

/**
 * @swagger
 * /blog-categories:
 *   get:
 *     summary: Get all blog categories
 *     tags: [Blog Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     summary: Create blog category (Admin only)
 *     tags: [Blog Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.get('/', getAllBlogCategories);

/**
 * @swagger
 * /blog-categories/{id}:
 *   get:
 *     summary: Get blog category by ID
 *     tags: [Blog Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *   put:
 *     summary: Update blog category (Admin only)
 *     tags: [Blog Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *   delete:
 *     summary: Delete blog category (Admin only)
 *     tags: [Blog Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.get('/:id', getBlogCategoryById);

// Admin routes
router.post('/', authenticateUser, authorizeRoles('admin'), createBlogCategory);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateBlogCategory);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteBlogCategory);

export default router;