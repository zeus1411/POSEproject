import express from 'express';
import { syncCatalog, getCatalogStatus } from '../controllers/aiCatalogController.js';
import { authenticateUser, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /ai/catalog/sync:
 *   post:
 *     summary: Trigger catalog sync (Admin only)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sync triggered
 */
router.post('/catalog/sync', authenticateUser, authorizeRoles('admin'), syncCatalog);

/**
 * @swagger
 * /ai/catalog/status:
 *   get:
 *     summary: Get catalog sync status (Admin only)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sync status
 */
router.get('/catalog/status', authenticateUser, authorizeRoles('admin'), getCatalogStatus);

export default router;
