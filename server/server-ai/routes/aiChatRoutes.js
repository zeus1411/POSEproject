import express from 'express';
import {
  chatOnce,
  getChatSession,
  mergeGuestChatSession,
  streamAiChat
} from '../controllers/aiChatController.js';
import { authenticateUser, optionalAuthenticateUser } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI chat and RAG endpoints
 */

/**
 * @swagger
 * /ai/chat/stream:
 *   post:
 *     summary: Stream AI chat response (SSE)
 *     tags: [AI]
 *     security: []
 *     parameters:
 *       - in: header
 *         name: x-anonymous-id
 *         schema:
 *           type: string
 *         required: false
 *         description: Anonymous session id (optional)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *               mode:
 *                 type: string
 *                 enum: [document_rag, catalog_qa]
 *               message:
 *                 type: string
 *               anonymousId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Streamed response via text/event-stream
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.post('/chat/stream', optionalAuthenticateUser, streamAiChat);

router.get('/chat/session', optionalAuthenticateUser, getChatSession);

router.post('/chat/merge-guest-session', authenticateUser, mergeGuestChatSession);

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Get AI chat response (JSON)
 *     tags: [AI]
 *     security: []
 *     parameters:
 *       - in: header
 *         name: x-anonymous-id
 *         schema:
 *           type: string
 *         required: false
 *         description: Anonymous session id (optional)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *               mode:
 *                 type: string
 *                 enum: [document_rag, catalog_qa]
 *               message:
 *                 type: string
 *               anonymousId:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/chat', optionalAuthenticateUser, chatOnce);

export default router;
