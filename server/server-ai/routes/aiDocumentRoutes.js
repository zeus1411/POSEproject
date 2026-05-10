import express from 'express';
import { uploadDocument } from '../controllers/aiDocumentController.js';
import { authenticateUser } from '../../middlewares/auth.js';
import { uploadAiDocument } from '../middlewares/aiUpload.js';

const router = express.Router();

router.post('/documents/upload', authenticateUser, uploadAiDocument.single('file'), uploadDocument);

export default router;
