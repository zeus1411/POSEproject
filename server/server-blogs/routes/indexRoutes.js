import express from 'express';
import blogCategoryRoutes from './blogCategoryRoutes.js';
import tagRoutes from './tagRoutes.js';
import blogRoutes from './blogRoutes.js';

const router = express.Router();

// Mount Blog routes
router.use('/blog-categories', blogCategoryRoutes);
router.use('/tags', tagRoutes);
router.use('/blogs', blogRoutes);

export default router;