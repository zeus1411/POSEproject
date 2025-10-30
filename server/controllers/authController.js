// controllers/authController.js
import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import { 
    BadRequestError, 
    UnauthenticatedError 
} from '../utils/errorHandler.js';
import { 
    attachCookiesToResponse,
    createTokenUser
} from '../utils/jwt.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

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
        token,
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
        token,
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

// @desc    Send OTP to user's email for password reset
const sendOTP = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        throw new BadRequestError('Please provide email');
    }

    const user = await User.findOne({ email });
    if (!user) {
        // For security, don't reveal if the email exists or not
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'If an account with that email exists, an OTP has been sent'
        });
    }

    // Generate and save OTP
    const otp = user.generatePasswordResetOTP();
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset OTP',
            message: `Your OTP for password reset is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>You have requested to reset your password. Use the following OTP to proceed:</p>
                    <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; text-align: center; margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
                        ${otp}
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email or contact support if you have any concerns.</p>
                </div>
            `
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'If an account with that email exists, an OTP has been sent',
            email // Return the email for the next step
        });
    } catch (error) {
        user.resetPasswordOTP = undefined;
        await user.save({ validateBeforeSave: false });
        throw new Error('Email could not be sent');
    }
};

// @desc    Verify OTP and reset password
const verifyOTPAndResetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new BadRequestError('Please provide email, OTP and new password');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new BadRequestError('Invalid request');
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
        throw new BadRequestError('Invalid or expired OTP');
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOTP = undefined; // Clear the OTP after successful verification
    await user.save();

    // Generate token and send response
    const { token, tokenUser } = attachCookiesToResponse(res, user);
    
    res.status(StatusCodes.OK).json({
        success: true,
        user: tokenUser,
        token,
        message: 'Password reset successful'
    });
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        throw new BadRequestError('Please provide a password');
    }

    // Hash token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        throw new BadRequestError('Invalid or expired reset token');
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    // Log the user in by sending back token
    const { token: authToken, tokenUser } = attachCookiesToResponse(res, user);

    res.status(StatusCodes.OK).json({
        success: true,
        user: tokenUser,
        token: authToken,
        message: 'Password reset successful'
    });
};

export { 
    register, 
    login, 
    logout, 
    getCurrentUser,
    sendOTP,
    verifyOTPAndResetPassword as resetPassword
};