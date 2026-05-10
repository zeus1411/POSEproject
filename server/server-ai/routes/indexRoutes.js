import express from 'express';
import aiChatRoutes from './aiChatRoutes.js';
import aiDocumentRoutes from './aiDocumentRoutes.js';

const router = express.Router();

router.use('/ai', aiChatRoutes);
router.use('/ai', aiDocumentRoutes);

export default router;
