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
  uploadDescriptionImage
} from '../controllers/productController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// Public routes (no authentication required) - với rate limiting
router.get('/', getProducts);
router.get('/search', searchProducts);

// Get product by ID - optional authentication (cho admin xem inactive products)
router.get('/:id', (req, res, next) => {
  // Optional auth: Nếu có token thì authenticate, không có thì tiếp tục
  const token = req.signedCookies.token || req.cookies.token;
  if (token) {
    return authenticateUser(req, res, next);
  }
  next();
}, getProductById);

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

// Upload image for description (TinyMCE)
router.post(
  '/upload-description-image',
  authenticateUser,
  authorizeRoles('admin'),
  upload.single('image'),
  uploadDescriptionImage
);

router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteProduct);

export default router;
