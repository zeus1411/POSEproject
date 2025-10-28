import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart
} from '../controllers/cartController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateUser);

// Lấy giỏ hàng
router.get('/', getCart);

// Xác thực giỏ hàng
router.post('/validate', validateCart);

// Thêm sản phẩm vào giỏ
router.post('/items', addToCart);

// Cập nhật số lượng sản phẩm
router.patch('/items/:productId', updateCartItem);

// Xóa sản phẩm khỏi giỏ
router.delete('/items/:productId', removeFromCart);

// Xóa toàn bộ giỏ hàng
router.delete('/', clearCart);

export default router;