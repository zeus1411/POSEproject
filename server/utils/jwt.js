// utils/jwt.js
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { UnauthenticatedError } from './errorHandler.js';

// Generate JWT token
const generateToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME || '1d' }
    );
};

// Verify JWT token
const verifyToken = (token) => {
    if (!token) {
        throw new UnauthenticatedError('No token provided');
    }
    return jwt.verify(token, process.env.JWT_SECRET);
};

// Create JWT and attach to cookies
const createTokenUser = (user) => {
    return {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName, // Changed from fullname to fullName to match User model
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address
    };
};

// Attach cookies to response
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

// Verify user authentication
const authenticateUser = (req, res, next) => {
    const token = req.signedCookies.token;

    if (!token) {
        throw new UnauthenticatedError('Authentication invalid');
    }

    try {
        const payload = verifyToken(token);
        req.user = payload;
        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid');
    }
};

// Authorize permissions
const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new UnauthorizedError('Unauthorized to access this route');
        }
        next();
    };
};

export {
    generateToken,
    verifyToken,
    createTokenUser,
    attachCookiesToResponse,
    authenticateUser,
    authorizePermissions
};