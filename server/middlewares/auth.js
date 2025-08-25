import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { 
            userId: decoded.userId,
            name: decoded.name,
            role: decoded.role 
        };
        next();
    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ 
            msg: 'Not authorized to access this route' 
        });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(StatusCodes.FORBIDDEN).json({ 
                msg: `Role ${req.user.role} is not authorized to access this route` 
            });
        }
        next();
    };
};

export { auth, authorizeRoles };