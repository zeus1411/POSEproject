import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { UnauthenticatedError, UnauthorizedError } from '../utils/errorHandler.js';

// ============================================
// JWT UTILITY FUNCTIONS
// ============================================

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME || '1d' }
    );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
    if (!token) {
        throw new UnauthenticatedError('No token provided');
    }
    return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Create token user object from user data
 * @param {Object} user - User object from database
 * @returns {Object} Token user object
 */
const createTokenUser = (user) => {
    return {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        avatar: user.avatar
    };
};

/**
 * Attach JWT token to cookies
 * @param {Object} res - Express response object
 * @param {Object} user - User object
 * @returns {Object} { token, tokenUser }
 */
const attachCookiesToResponse = (res, user) => {
    const tokenUser = createTokenUser(user);
    const token = generateToken(tokenUser);
    
    const oneDay = 1000 * 60 * 60 * 24; // 1 day
    
    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        sameSite: 'strict'
    });

    // Return both the token and tokenUser
    return { token, tokenUser };
};

// ============================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARES
// ============================================

// Authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.signedCookies.token || 
                     (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                        ? req.headers.authorization.split(' ')[1] 
                        : null);

        if (!token) {
            throw new UnauthenticatedError('Xác thực không thành công. Vui lòng đăng nhập lại.');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
        // Attach user to request object
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            role: (decoded.role || '').toLowerCase()
        };
        

        next();
    } catch (error) {
        // Handle different JWT errors
        if (error.name === 'TokenExpiredError') {
            throw new UnauthenticatedError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        if (error.name === 'JsonWebTokenError') {
            throw new UnauthenticatedError('Token không hợp lệ. Vui lòng đăng nhập lại.');
        }
        
        // Re-throw if it's already an UnauthenticatedError
        if (error instanceof UnauthenticatedError) {
            throw error;
        }
        
        throw new UnauthenticatedError('Xác thực không thành công. Vui lòng đăng nhập lại.');
    }
};

// Authorization middleware for roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        
        if (!req.user) {
            throw new UnauthenticatedError('Bạn cần đăng nhập để thực hiện thao tác này');
        }
        
        if (!roles.includes(req.user.role)) {
            throw new UnauthorizedError(
                `Chức năng này chỉ dành cho người dùng có quyền: ${roles.join(', ')}`
            );
        }
        
        
        next();
    };
};

// Check if user is the owner of the resource
const checkOwnership = (modelName = 'user', paramName = 'id') => {
    return async (req, res, next) => {
        try {           
            const Model = require(`../models/${modelName}.js`);
            const resourceId = req.params[paramName];
            const userId = req.user.userId;

            
            const resource = await Model.findById(resourceId);
            
            if (!resource) {
                throw new NotFoundError(`Không tìm thấy tài nguyên`);
            }
            
            // If user is admin, bypass ownership check
            if (req.user.role === 'admin') {
                return next();
            }
            
            // Check if the resource has a user field and if it matches the logged-in user
            if (resource.user && resource.user.toString() !== userId) {
                throw new UnauthorizedError('Bạn không có quyền truy cập tài nguyên này');
            }
            
            // For resources that might use different field names for user reference
            if (resource.userId && resource.userId.toString() !== userId) {
                throw new UnauthorizedError('Bạn không có quyền truy cập tài nguyên này');
            }
            
            next();
        } catch (error) {
            throw error;
        }
    };
};

export { 
    // JWT Utilities
    generateToken,
    verifyToken,
    createTokenUser,
    attachCookiesToResponse,
    // Middlewares
    authenticateUser, 
    authorizeRoles, 
    checkOwnership 
};