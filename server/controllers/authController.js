// controllers/authController.js
import { StatusCodes } from 'http-status-codes';
import authService from '../services/authService.js';
import { 
    attachCookiesToResponse,
} from '../middlewares/auth.js';

const register = async (req, res) => {
    const { email, password, username } = req.body;

    const user = await authService.register({ email, password, username, ...req.body });
    
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

    const user = await authService.login(email, password);

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
    const userResponse = await authService.getCurrentUser(req.user.userId);
    
    res.status(StatusCodes.OK).json({ 
        success: true,
        user: userResponse
    });
};

// @desc    Send OTP to user's email for password reset
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const sendOTP = async (req, res) => {
    const { email } = req.body;
    
    const result = await authService.sendOTP(email);

    res.status(StatusCodes.OK).json(result);
};

// @desc    Resend OTP to user's email
// @route   POST /api/v1/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
    const { email } = req.body;
    
    const result = await authService.resendOTP(email);

    res.status(StatusCodes.OK).json(result);
};

// @desc    Verify OTP and reset password
// @route   POST /api/v1/auth/reset-password
// @access  Public
const verifyOTPAndResetPassword = async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    const user = await authService.verifyOTPAndResetPassword({ email, otp, newPassword, confirmPassword });

    // Auto-login after successful password reset
    const { token, tokenUser } = attachCookiesToResponse(res, user);
    
    res.status(StatusCodes.OK).json({
        success: true,
        user: tokenUser,
        token,
        message: 'Đặt lại mật khẩu thành công! Bạn đã được đăng nhập tự động'
    });
};

export { 
    register, 
    login, 
    logout, 
    getCurrentUser,
    sendOTP,
    resendOTP,
    verifyOTPAndResetPassword as resetPassword
};