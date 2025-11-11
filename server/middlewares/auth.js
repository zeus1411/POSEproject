import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { UnauthenticatedError, UnauthorizedError } from '../utils/errorHandler.js';

// Authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        // Log để debug
        console.log('=== AUTH MIDDLEWARE ===');
        console.log('Request URL:', req.method, req.originalUrl);
        console.log('Cookies:', req.cookies);
        console.log('Signed Cookies:', req.signedCookies);
        console.log('Authorization Header:', req.headers.authorization);
        
        // Check for token in cookies first, then in Authorization header
        const token = req.signedCookies.token || 
                     (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                        ? req.headers.authorization.split(' ')[1] 
                        : null);

        console.log('Token found:', token ? 'Yes' : 'No');

        if (!token) {
            throw new UnauthenticatedError('Xác thực không thành công. Vui lòng đăng nhập lại.');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('Token decoded:', decoded);
        
        // Attach user to request object
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role
        };
        
        console.log('User authenticated:', req.user);
        console.log('======================\n');
        
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        console.error('======================\n');
        
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
        console.log('=== AUTHORIZE ROLES ===');
        console.log('Required roles:', roles);
        console.log('User role:', req.user?.role);
        
        if (!req.user) {
            throw new UnauthenticatedError('Bạn cần đăng nhập để thực hiện thao tác này');
        }
        
        if (!roles.includes(req.user.role)) {
            console.log('Authorization failed: Role not allowed');
            console.log('=======================\n');
            throw new UnauthorizedError(
                `Chức năng này chỉ dành cho người dùng có quyền: ${roles.join(', ')}`
            );
        }
        
        console.log('Authorization successful');
        console.log('=======================\n');
        
        next();
    };
};

// Check if user is the owner of the resource
const checkOwnership = (modelName = 'user', paramName = 'id') => {
    return async (req, res, next) => {
        try {
            console.log('=== CHECK OWNERSHIP ===');
            console.log('Model:', modelName);
            console.log('Param:', paramName);
            
            const Model = require(`../models/${modelName}.js`);
            const resourceId = req.params[paramName];
            const userId = req.user.userId;
            
            console.log('Resource ID:', resourceId);
            console.log('User ID:', userId);
            
            const resource = await Model.findById(resourceId);
            
            if (!resource) {
                throw new NotFoundError(`Không tìm thấy tài nguyên`);
            }
            
            // If user is admin, bypass ownership check
            if (req.user.role === 'admin') {
                console.log('Admin user - ownership check bypassed');
                console.log('=======================\n');
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
            
            console.log('Ownership verified');
            console.log('=======================\n');
            
            next();
        } catch (error) {
            console.error('Ownership check error:', error.message);
            console.error('=======================\n');
            throw error;
        }
    };
};

export { 
    authenticateUser, 
    authorizeRoles, 
    checkOwnership 
};