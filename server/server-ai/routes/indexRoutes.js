import express from 'express';
import aiChatRoutes from './aiChatRoutes.js';

const router = express.Router();

router.use('/ai', aiChatRoutes);

export default router;
