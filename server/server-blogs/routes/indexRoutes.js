import express from 'express';
import blogCategoryRoutes from './blogCategoryRoutes.js';
import tagRoutes from './tagRoutes.js';
import blogRoutes from './blogRoutes.js';
import commentRoutes from './commentRoutes.js';
import blogInteractionRoutes from './blogInteractionRoutes.js';

const router = express.Router();

// Mount Blog routes
router.use('/blog-categories', blogCategoryRoutes);
router.use('/tags', tagRoutes);
router.use('/blogs', blogRoutes);
router.use('/comments', commentRoutes);
router.use('/blog-interactions', blogInteractionRoutes);

export default router;