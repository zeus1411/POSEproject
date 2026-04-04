// routes/authRoutes.js
import express from 'express';
import {
    register,
    login,
    logout,
    getCurrentUser,
    sendOTP,
    resendOTP,
    resetPassword,
    sendRegistrationOTP,
    resendRegistrationOTP,
    verifyRegistrationOTP
} from '../controllers/authController.js';
import { googleAuth } from '../controllers/googleAuthController.js';
import { authenticateUser } from '../../middlewares/auth.js';
import { authLimiter } from '../../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Authorization APIs
 */

/**
 * @swagger
 * /auth/register/send-otp:
 *   post:
 *     summary: Send registration OTP to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.post('/register/send-otp', authLimiter, sendRegistrationOTP);

/**
 * @swagger
 * /auth/register/verify-otp:
 *   post:
 *     summary: Verify OTP and create user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register/verify-otp', authLimiter, verifyRegistrationOTP);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', authLimiter, login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 */
router.get('/me', authenticateUser, getCurrentUser);

// Other routes (leaving as is for brevity, but they are now scanable)
router.post('/register/resend-otp', authLimiter, resendRegistrationOTP);
router.post('/register', authLimiter, register);
router.post('/google', authLimiter, googleAuth);
router.post('/forgot-password', authLimiter, sendOTP);
router.post('/resend-otp', authLimiter, resendOTP);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/logout', authenticateUser, logout);

export default router;
