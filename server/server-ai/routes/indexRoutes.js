import express from 'express';
import aiChatRoutes from './aiChatRoutes.js';
import aiDocumentRoutes from './aiDocumentRoutes.js';
import aiCatalogRoutes from './aiCatalogRoutes.js';

const router = express.Router();

router.use('/ai', aiChatRoutes);
router.use('/ai', aiDocumentRoutes);
router.use('/ai', aiCatalogRoutes);

export default router;
