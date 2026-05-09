import express from 'express';
import { streamAiChat, chatOnce } from '../controllers/aiChatController.js';
import { optionalAuthenticateUser } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/chat/stream', optionalAuthenticateUser, streamAiChat);
router.post('/chat', optionalAuthenticateUser, chatOnce);

export default router;
