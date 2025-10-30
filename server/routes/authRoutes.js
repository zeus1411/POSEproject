// routes/authRoutes.js
import express from 'express';
import {
    register,
    login,
    logout,
    getCurrentUser,
    sendOTP,
    resetPassword
} from '../controllers/authController.js';
import { authenticateUser } from '../utils/jwt.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', sendOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/logout', authenticateUser, logout);
router.get('/me', authenticateUser, getCurrentUser);

export default router;