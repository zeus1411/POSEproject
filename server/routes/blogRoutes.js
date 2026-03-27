import express from 'express';
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    getBlogBySlug,
    updateBlog,
    deleteBlog
} from '../controllers/blogController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';
import { uploadBlogImage } from '../middlewares/upload.js';

const router = express.Router();

/**
 * Optional authentication helper: 
 * If a token is provided, it authenticates the user (to show personal drafts/pending posts).
 * If no token, it simply continues to the controller as a guest.
 */
const optionalAuth = (req, res, next) => {
    const token = req.signedCookies.token || 
                 (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                    ? req.headers.authorization.split(' ')[1] 
                    : null);
    if (token) {
        return authenticateUser(req, res, next);
    }
    next();
};

// Public routes (with optional auth for personal visibility context)
router.get('/', optionalAuth, getAllBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', optionalAuth, getBlogById);

// Protected routes
router.post(
    '/', 
    authenticateUser, 
    uploadBlogImage.single('coverImage'), 
    createBlog
);

router.put(
    '/:id', 
    authenticateUser, 
    uploadBlogImage.single('coverImage'), 
    updateBlog
);

router.delete('/:id', authenticateUser, deleteBlog);

export default router;
