import express from 'express';
import ecommerceRoutes from '../server-ecommerce/routes/indexRoutes.js';
import blogRoutes from '../server-blogs/routes/indexRoutes.js';
import aiRoutes from '../server-ai/routes/indexRoutes.js';

const router = express.Router();

// Mount Domain Routes
router.use('/', ecommerceRoutes);
router.use('/', blogRoutes);
router.use('/', aiRoutes);

export default router;
