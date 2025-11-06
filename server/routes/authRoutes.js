// routes/authRoutes.js
import express from 'express';
import {
    register,
    login,
    logout,
    getCurrentUser,
    sendOTP,
    resendOTP,
    resetPassword
} from '../controllers/authController.js';
import { authenticateUser } from '../utils/jwt.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', sendOTP); // Step 1: Send OTP
router.post('/resend-otp', resendOTP); // Step 1.1: Resend OTP (exception flow 5.1)
router.post('/reset-password', resetPassword); // Step 2: Verify OTP and reset password

// Protected routes
router.get('/logout', authenticateUser, logout);
router.get('/me', authenticateUser, getCurrentUser);

export default router;