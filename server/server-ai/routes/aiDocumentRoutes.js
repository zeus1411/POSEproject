import express from 'express';
import { deleteDocument, listDocuments, uploadDocument } from '../controllers/aiDocumentController.js';
import { authenticateUser, authorizeRoles } from '../../middlewares/auth.js';
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

router.post(
	'/documents/upload',
	authenticateUser,
	authorizeRoles('admin'),
	uploadAiDocument.single('file'),
	uploadDocument
);

/**
 * @swagger
 * /ai/documents:
 *   get:
 *     summary: List uploaded documents (Admin only)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Document list
 */
router.get('/documents', authenticateUser, authorizeRoles('admin'), listDocuments);

/**
 * @swagger
 * /ai/documents/{fileName}:
 *   delete:
 *     summary: Delete uploaded document (Admin only)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted
 */
router.delete('/documents/:fileName', authenticateUser, authorizeRoles('admin'), deleteDocument);

export default router;
