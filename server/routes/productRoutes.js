import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts
} from '../controllers/productController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Public (user, guest): xem danh sách, chi tiết, tìm kiếm
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Admin-only: CRUD
router.post('/', authenticateUser, authorizeRoles('admin'), createProduct);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateProduct);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteProduct);

export default router;
