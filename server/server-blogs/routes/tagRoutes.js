import express from 'express';
import {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag
} from '../controllers/tagController.js';
import { authenticateUser, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllTags);
router.get('/:id', getTagById);

// Admin routes
router.post('/', authenticateUser, authorizeRoles('admin'), createTag);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateTag);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteTag);

export default router;

