import express from 'express';
import {
    createComment,
    getBlogComments,
    deleteComment,
    updateComment
} from '../controllers/commentController.js';
import { authenticateUser, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Blog comment management APIs
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blogId
 *               - content
 *             properties:
 *               blogId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
router.post('/', authenticateUser, createComment);

/**
 * @swagger
 * /comments/blog/{blogId}:
 *   get:
 *     summary: Get comments for a specific blog post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/blog/:blogId', getBlogComments);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment (Author or Admin)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
router.delete('/:id', authenticateUser, deleteComment);

// Thêm import updateComment từ controller
router.put('/:id', authenticateUser, updateComment);

export default router;
