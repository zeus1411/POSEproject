import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  updateProductImages,
  uploadProductImages
} from '../controllers/productController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// Public (user, guest): xem danh sách, chi tiết, tìm kiếm
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Admin-only: CRUD with image uploads
router.post(
  '/', 
  authenticateUser, 
  authorizeRoles('admin'),
  upload.array('images', 10), // 'images' is the field name, max 10 files
  uploadProductImages,
  createProduct
);

router.put(
  '/:id', 
  authenticateUser, 
  authorizeRoles('admin'),
  upload.array('images', 10), // 'images' is the field name, max 10 files
  uploadProductImages,
  updateProduct
);

// Update product images only
router.post(
  '/:id/update-images',
  authenticateUser,
  authorizeRoles('admin'),
  updateProductImages
);

router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteProduct);

export default router;
