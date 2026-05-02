import express from 'express';
import {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
    updateTagStatus
} from '../controllers/tagController.js';
import { authenticateUser, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Blog Tag management APIs
 */

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of tags
 *   post:
 *     summary: Create a new tag (Admin only)
 *     tags: [Tags]
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
 *         description: Tag created
 */
router.get('/', getAllTags);

/**
 * @swagger
 * /tags/{id}:
 *   get:
 *     summary: Get tag by ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag details
 *   put:
 *     summary: Update tag (Admin only)
 *     tags: [Tags]
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
 *         description: Tag updated
 *   delete:
 *     summary: Delete tag (Admin only)
 *     tags: [Tags]
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
 *         description: Tag deleted
 */
router.get('/:id', getTagById);

// Admin routes
router.post('/', authenticateUser, authorizeRoles('admin'), createTag);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateTag);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteTag);
router.patch('/:id/status', authenticateUser, authorizeRoles('admin'), updateTagStatus);

export default router;