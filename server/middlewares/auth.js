import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { UnauthenticatedError, UnauthorizedError } from '../utils/errorHandler.js';

// Authentication middleware
const authenticateUser = async (req, res, next) => {
    // Check for token in cookies first, then in Authorization header
    const token = req.signedCookies.token || 
                 (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                    ? req.headers.authorization.split(' ')[1] 
                    : null);

    if (!token) {
        throw new UnauthenticatedError('Xác thực không thành công. Vui lòng đăng nhập lại.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user to request object
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        // Handle different JWT errors
        if (error.name === 'TokenExpiredError') {
            throw new UnauthenticatedError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
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
    };
};

export { 
    authenticateUser, 
    authorizeRoles, 
    checkOwnership 
};