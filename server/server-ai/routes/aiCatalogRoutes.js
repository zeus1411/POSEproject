import express from 'express';
import { syncCatalog, getCatalogStatus } from '../controllers/aiCatalogController.js';
import { authenticateUser, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/catalog/sync', authenticateUser, authorizeRoles('admin'), syncCatalog);
router.get('/catalog/status', authenticateUser, authorizeRoles('admin'), getCatalogStatus);

export default router;
