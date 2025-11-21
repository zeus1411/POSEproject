import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  updateProductImages,
  uploadProductImages,
  updateProductVariants,
  addVariant,
  updateVariant,
  deleteVariant
} from '../controllers/productController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// Public routes (no authentication required)
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

// ========== PRODUCT VARIANTS ROUTES ==========
// Update all variants and options for a product
router.put(
  '/:id/variants',
  authenticateUser,
  authorizeRoles('admin'),
  updateProductVariants
);

// Add a single variant
router.post(
  '/:id/variants',
  authenticateUser,
  authorizeRoles('admin'),
  addVariant
);

// Update a specific variant
router.put(
  '/:id/variants/:variantId',
  authenticateUser,
  authorizeRoles('admin'),
  updateVariant
);

// Delete a specific variant
router.delete(
  '/:id/variants/:variantId',
  authenticateUser,
  authorizeRoles('admin'),
  deleteVariant
);

export default router;
