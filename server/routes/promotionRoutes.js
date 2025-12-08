import express from 'express';
import {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus,
  getAvailablePromotions,
  getAllActiveCoupons,
  getPromotionsForProduct,
  checkCouponEligibility,
  validateCoupon,
  applyPromotions,
  applyPromotionsToCart,
  getUnviewedPromotions,
  markPromotionAsViewed
} from '../controllers/promotionController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// ==================== USER ROUTES ====================
router.get('/available', authenticateUser, getAvailablePromotions);
router.get('/coupons/active', authenticateUser, getAllActiveCoupons);
router.get('/unviewed', authenticateUser, getUnviewedPromotions);
router.post('/:id/mark-viewed', authenticateUser, markPromotionAsViewed);
router.get('/product/:productId', getPromotionsForProduct); // Not in use
router.post('/check-eligibility', authenticateUser, checkCouponEligibility);
router.post('/validate', authenticateUser, validateCoupon);
router.post('/apply', authenticateUser, applyPromotions); // Not in use
router.post('/apply-to-cart', authenticateUser, applyPromotionsToCart);

// ==================== ADMIN ROUTES ====================
router.use(authenticateUser); 

router.post('/', authorizeRoles('admin'), createPromotion);
router.get('/', authorizeRoles('admin'), getAllPromotions);
router.get('/:id', authorizeRoles('admin'), getPromotionById);
router.put('/:id', authorizeRoles('admin'), updatePromotion);
router.delete('/:id', authorizeRoles('admin'), deletePromotion);
router.patch('/:id/toggle', authorizeRoles('admin'), togglePromotionStatus);

export default router;
