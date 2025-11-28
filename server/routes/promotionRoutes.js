import express from 'express';
import {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus,
  getAvailablePromotions,
  getPromotionsForProduct,
  validateCoupon,
  applyPromotions,
  getPromotionStatistics
} from '../controllers/promotionController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// ==================== USER ROUTES ====================
router.get('/available', authenticateUser, getAvailablePromotions);
router.get('/product/:productId', getPromotionsForProduct);
router.post('/validate', authenticateUser, validateCoupon);
router.post('/apply', authenticateUser, applyPromotions);

// ==================== ADMIN ROUTES ====================
router.use(authenticateUser); // All routes below require authentication

router.post('/', authorizeRoles('admin'), createPromotion);
router.get('/', authorizeRoles('admin'), getAllPromotions);
router.get('/statistics', authorizeRoles('admin'), getPromotionStatistics);
router.get('/:id', authorizeRoles('admin'), getPromotionById);
router.put('/:id', authorizeRoles('admin'), updatePromotion);
router.delete('/:id', authorizeRoles('admin'), deletePromotion);
router.patch('/:id/toggle', authorizeRoles('admin'), togglePromotionStatus);

export default router;
