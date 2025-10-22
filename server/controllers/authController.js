// controllers/authController.js
import { StatusCodes } from 'http-status-codes';
import User from '../models/Users.js';
import { 
    BadRequestError, 
    UnauthenticatedError 
} from '../utils/errorHandler.js';
import { 
    attachCookiesToResponse,
    createTokenUser
} from '../utils/jwt.js';

const register = async (req, res) => {
    const { email, password, username } = req.body;

    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
        throw new BadRequestError('Email already exists');
    }

    const user = await User.create({ ...req.body });
    
    const { token, tokenUser } = attachCookiesToResponse(res, user);
    
    res.status(StatusCodes.CREATED).json({ 
        success: true,
        user: tokenUser,
        token: token,  // Include the token in the response
        message: 'User registered successfully'
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const { token, tokenUser } = attachCookiesToResponse(res, user);
    
    res.status(StatusCodes.OK).json({ 
        success: true,
        user: tokenUser,
        token: token,  // Include the token in the response
        message: 'Login successful'
    });
};

const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.status(StatusCodes.OK).json({ 
        success: true,
        message: 'User logged out!'
    });
};

const getCurrentUser = async (req, res) => {
    const user = await User.findOne({ _id: req.user.userId }).select('-password');
    res.status(StatusCodes.OK).json({ 
        success: true,
        user: createTokenUser(user)
    });
};

export { 
    register, 
    login, 
    logout, 
    getCurrentUser 
};