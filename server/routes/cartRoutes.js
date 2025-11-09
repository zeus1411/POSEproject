import express from 'express';
import {
  getCart,
  getCartSummary,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart
} from '../controllers/cartController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

// All cart routes require authentication
router.use(authenticateUser);

// Get cart summary only (optimized - no full items)
router.get('/summary', getCartSummary);

// Get full cart
router.get('/', getCart);

// Add item to cart
router.post('/items', addToCart);

// Update cart item quantity
router.patch('/items/:productId', updateCartItem);

// Remove item from cart
router.delete('/items/:productId', removeFromCart);

// Clear entire cart
router.delete('/', clearCart);

// Validate cart before checkout
router.post('/validate', validateCart);

export default router;