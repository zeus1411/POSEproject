import express from 'express';
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts
} from '../controllers/productController.js';

const router = express.Router();

// Create product
router.post('/', createProduct);
// Get all products
router.get('/', getProducts);
// Search products (must be before "/:id")
router.get('/search', searchProducts);
// Get product by id
router.get('/:id', getProductById);
// Update product
router.put('/:id', updateProduct);
// Delete product
router.delete('/:id', deleteProduct);

export default router;
