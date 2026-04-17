import express from 'express';
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    getBlogBySlug,
    getPublicBlogs,
    updateBlog,
    deleteBlog,
    updateBlogStatus
} from '../controllers/blogController.js';
import { authenticateUser, authorizeRoles } from '../../middlewares/auth.js';
import { uploadBlogImage } from '../../middlewares/upload.js';

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

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management APIs
 */

/**
 * @swagger
 * /blogs/public:
 *   get:
 *     summary: Get public blogs (Only PUBLISHED)
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category ID
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Tag ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of public blogs
 */
router.get('/public', getPublicBlogs);

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of blogs
 *   post:
 *     summary: Create a new blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *                 description: ID of the blog category
 *               tags:
 *                 type: string
 *                 description: Comma-separated list of tag IDs
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PENDING, PUBLISHED]
 *               isFeatured:
 *                 type: boolean
 *               relatedProducts:
 *                 type: string
 *                 description: Comma-separated list of product IDs
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Blog created
 */
router.get('/', optionalAuth, getAllBlogs);

/**
 * @swagger
 * /blogs/slug/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog details
 */
router.get('/slug/:slug', getBlogBySlug);

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog details
 *   put:
 *     summary: Update blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
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
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PENDING, PUBLISHED]
 *               isFeatured:
 *                 type: boolean
 *               relatedProducts:
 *                 type: string
 *                 description: Comma-separated list of product IDs
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Blog updated
 *   delete:
 *     summary: Delete blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog deleted
 * 
 *   patch:
 *     summary: Update blog status (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PUBLISHED, REJECTED]
 *                 description: |
 *                   'PUBLISHED' to accept and post.
 *                   'REJECTED' to send back to DRAFT for fixing.
 *               rejectionReason:
 *                 type: string
 *                 description: Required if status is REJECTED.
 *     responses:
 *       200:
 *         description: Blog status updated
 */
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

router.patch('/:id/status', authenticateUser, authorizeRoles('admin'), updateBlogStatus);

router.delete('/:id', authenticateUser, deleteBlog);

export default router;
