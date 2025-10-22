import User from '../models/Users.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../config/errorsMessage.js';

const register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        throw new BadRequestError('Please provide username, email and password');
    }

    const user = await User.create({ ...req.body });
    const token = user.createJWT();
    
    res.status(StatusCodes.CREATED).json({ 
        user: { 
            username: user.username,
            email: user.email,
            role: user.role 
        }, 
        token 
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const token = user.createJWT();
    res.status(StatusCodes.OK).json({ 
        user: { 
            username: user.username,
            email: user.email,
            role: user.role 
        }, 
        token 
    });
};

export { register, login };