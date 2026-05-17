import express from 'express';
import { uploadDocument } from '../controllers/aiDocumentController.js';
import { authenticateUser } from '../../middlewares/auth.js';
import { uploadAiDocument } from '../middlewares/aiUpload.js';

const router = express.Router();

/**
 * @swagger
 * /ai/documents/upload:
 *   post:
 *     summary: Upload document for RAG indexing
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document indexed
 */

router.post('/documents/upload', authenticateUser, uploadAiDocument.single('file'), uploadDocument);

export default router;
