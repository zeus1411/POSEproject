import express from 'express';
import {
    toggleLike,
    toggleBookmark,
    getMyInteractions
} from '../controllers/blogInteractionController.js';
import { authenticateUser } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: BlogInteractions
 *   description: Blog Like and Bookmark toggle APIs
 */

/**
 * @swagger
 * /blog-interactions/like/{blogId}:
 *   post:
 *     summary: Toggle Like on a blog post
 *     tags: [BlogInteractions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like status toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isActed:
 *                   type: boolean
 *                   description: true if Liked, false if Unliked
 *                 newCount:
 *                   type: number
 */
router.post('/like/:blogId', authenticateUser, toggleLike);

/**
 * @swagger
 * /blog-interactions/bookmark/{blogId}:
 *   post:
 *     summary: Toggle Bookmark on a blog post
 *     tags: [BlogInteractions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookmark status toggled
 */
router.post('/bookmark/:blogId', authenticateUser, toggleBookmark);

/**
 * @swagger
 * /blog-interactions/status:
 *   post:
 *     summary: Get user interaction status for a list of blog IDs
 *     tags: [BlogInteractions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blogIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Map of interaction statuses
 */
router.post('/status', authenticateUser, getMyInteractions);

export default router;
