import express from 'express';
import ecommerceRoutes from '../server-ecommerce/routes/indexRoutes.js';
import blogRoutes from '../server-blogs/routes/indexRoutes.js';

const router = express.Router();

// Mount Domain Routes
router.use('/', ecommerceRoutes);
router.use('/', blogRoutes);

export default router;
