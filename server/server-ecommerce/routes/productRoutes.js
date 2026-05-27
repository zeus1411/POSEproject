import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  searchProductsQuick,
  getPersonalizedRecommendations,
  updateProductImages,
  uploadProductImages,
  uploadDescriptionImage
} from '../controllers/productController.js';
import { authenticateUser, authorizeRoles } from '../../middlewares/auth.js';
import { upload } from '../../middlewares/upload.js';

const router = express.Router();

// Public routes (no authentication required) - với rate limiting
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: E-commerce Product management APIs
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products (with pagination, filtering)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created
 */
router.get('/', getProducts);

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', searchProducts);

/**
 * @swagger
 * /products/search-quick:
 *   get:
 *     summary: Quick search products by name or SKU
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword (name or SKU)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of products found
 */
router.get('/search-quick', authenticateUser, searchProductsQuick);

router.get('/recommendations/for-you', authenticateUser, getPersonalizedRecommendations);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */
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

