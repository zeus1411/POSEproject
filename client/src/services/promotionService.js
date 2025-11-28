import api from './api';

/**
 * Promotion Service
 * Handles all promotion-related API calls
 */

// Get available promotions for user
export const getAvailablePromotions = async () => {
  const response = await api.get('/promotions/available');
  return response.data?.data;
};

// Get promotions for specific product
export const getPromotionsForProduct = async (productId) => {
  const response = await api.get(`/promotions/product/${productId}`);
  return response.data?.data;
};

// Validate coupon code
export const validateCoupon = async (code, cart) => {
  const response = await api.post('/promotions/validate', { code, cart });
  return response.data?.data;
};

// Apply promotions to cart (auto-apply)
export const applyPromotionsToCart = async (cart) => {
  const response = await api.post('/promotions/apply-to-cart', { cart });
  return response.data?.data;
};

export default {
  getAvailablePromotions,
  getPromotionsForProduct,
  validateCoupon,
  applyPromotionsToCart
};
