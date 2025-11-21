import express from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import userRoutes from './userRoutes.js';
import addressRoutes from './addressRoutes.js';
import locationRoutes from './locationRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import notificationRoutes from './notificationRoutes.js';
const router = express.Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/addresses', addressRoutes);
router.use('/locations', locationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
export default router;
