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
import { authenticateUser } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// ==================== REGISTRATION WITH OTP ====================
router.post('/register/send-otp', authLimiter, sendRegistrationOTP); // Step 1: Send OTP to email
router.post('/register/resend-otp', authLimiter, resendRegistrationOTP); // Step 1.1: Resend OTP
router.post('/register/verify-otp', authLimiter, verifyRegistrationOTP); // Step 2: Verify OTP and create user

// ==================== OLD ROUTES ====================
// Public routes với rate limiting
router.post('/register', authLimiter, register); // Old registration (no OTP)
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth); // Google OAuth
router.post('/forgot-password', authLimiter, sendOTP); // Step 1: Send OTP
router.post('/resend-otp', authLimiter, resendOTP); // Step 1.1: Resend OTP (exception flow 5.1)
router.post('/reset-password', authLimiter, resetPassword); // Step 2: Verify OTP and reset password

// Protected routes
router.get('/logout', authenticateUser, logout);
router.get('/me', authenticateUser, getCurrentUser);

export default router;