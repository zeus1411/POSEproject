// controllers/authController.js
import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import { 
    BadRequestError, 
    UnauthenticatedError, 
} from '../utils/errorHandler.js';
import { 
    attachCookiesToResponse,
    createTokenUser
} from '../utils/jwt.js';
import sendEmail from '../utils/sendEmail.js';

const register = async (req, res) => {
    const { email, password, username } = req.body;

    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
        throw new BadRequestError('Email already exists');
    }
    const usernameAlreadyExists = await User.findOne({ username });
    if (usernameAlreadyExists) {
        throw new BadRequestError('Username already exists');
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
    const user = await User.findOne({ _id: req.user.userId })
        .select('-password')
        .populate({
            path: 'address',
            select: 'fullName phoneNumber addressLine1 addressLine2 city district ward isDefault'
        });
    
    if (!user) {
        throw new UnauthenticatedError('User not found');
    }
    
    // Create a clean user object with all necessary fields
    const userResponse = {
        ...createTokenUser(user),
        // Include any additional fields that might be needed by the frontend
        address: user.address,
        avatar: user.avatar // Ensure avatar is included
    };
    
    console.log('Current user data:', userResponse); // Debug log
    
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
    
    if (!email) {
        throw new BadRequestError('Vui lòng cung cấp email');
    }

    const user = await User.findOne({ email });
    
    // Exception flow 4.1: Email không tồn tại
    if (!user) {
        throw new BadRequestError('Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại email');
    }

    // Generate and save OTP (5 minutes as per use case)
    const otp = user.generatePasswordResetOTP();
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user.email,
            subject: 'Mã OTP Đặt lại Mật khẩu',
            message: `Mã OTP của bạn để đặt lại mật khẩu là: ${otp}\n\nMã OTP này sẽ hết hạn sau 5 phút.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Yêu cầu Đặt lại Mật khẩu</h2>
                    <p style="color: #666;">Bạn đã yêu cầu đặt lại mật khẩu. Sử dụng mã OTP sau để tiếp tục:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        ${otp}
                    </div>
                    <p style="color: #e74c3c; font-weight: bold;">⏰ Mã OTP này sẽ hết hạn sau 5 phút.</p>
                    <p style="color: #666; margin-top: 30px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ nếu có bất kỳ thắc mắc nào.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px;">Email này được gửi tự động, vui lòng không trả lời.</p>
                </div>
            `
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Mã OTP đã được gửi đến email của bạn',
            email, // Trả về email cho bước tiếp theo
            expiresIn: 5 // Thời gian hết hạn (phút)
        });
    } catch (error) {
        // Nếu gửi email thất bại, xóa OTP đã lưu
        user.resetPasswordOTP = undefined;
        await user.save({ validateBeforeSave: false });
        throw new Error('Không thể gửi email. Vui lòng thử lại sau');
    }
};

// @desc    Resend OTP to user's email
// @route   POST /api/v1/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        throw new BadRequestError('Vui lòng cung cấp email');
    }

    const user = await User.findOne({ email });
    
    if (!user) {
        throw new BadRequestError('Email không tồn tại trong hệ thống');
    }

    // Check if previous OTP is still valid (prevent spam)
    if (user.resetPasswordOTP && user.resetPasswordOTP.expires) {
        const timeRemaining = new Date(user.resetPasswordOTP.expires) - new Date();
        // If OTP still has more than 4 minutes remaining, don't send new one
        if (timeRemaining > 4 * 60 * 1000) {
            const minutesLeft = Math.ceil(timeRemaining / 60000);
            throw new BadRequestError(`Mã OTP hiện tại vẫn còn hiệu lực. Vui lòng đợi ${minutesLeft} phút trước khi yêu cầu mã mới`);
        }
    }

    // Generate new OTP
    const otp = user.generatePasswordResetOTP();
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user.email,
            subject: 'Mã OTP Đặt lại Mật khẩu - Gửi lại',
            message: `Mã OTP mới của bạn để đặt lại mật khẩu là: ${otp}\n\nMã OTP này sẽ hết hạn sau 5 phút.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Gửi lại Mã OTP</h2>
                    <p style="color: #666;">Bạn đã yêu cầu gửi lại mã OTP. Sử dụng mã OTP mới sau để tiếp tục:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        ${otp}
                    </div>
                    <p style="color: #e74c3c; font-weight: bold;">⏰ Mã OTP này sẽ hết hạn sau 5 phút.</p>
                    <p style="color: #666; margin-top: 30px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ nếu có bất kỳ thắc mắc nào.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px;">Email này được gửi tự động, vui lòng không trả lời.</p>
                </div>
            `
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Mã OTP mới đã được gửi đến email của bạn',
            expiresIn: 5
        });
    } catch (error) {
        user.resetPasswordOTP = undefined;
        await user.save({ validateBeforeSave: false });
        throw new Error('Không thể gửi email. Vui lòng thử lại sau');
    }
};

// @desc    Verify OTP and reset password
// @route   POST /api/v1/auth/reset-password
// @access  Public
const verifyOTPAndResetPassword = async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
        throw new BadRequestError('Vui lòng cung cấp đầy đủ thông tin: email, OTP, mật khẩu mới và xác nhận mật khẩu');
    }

    // Exception flow 6.1: Mật khẩu và xác nhận không khớp
    if (newPassword !== confirmPassword) {
        throw new BadRequestError('Mật khẩu và xác nhận mật khẩu không khớp. Vui lòng nhập lại');
    }

    // Validate password length
    if (newPassword.length < 6) {
        throw new BadRequestError('Mật khẩu phải có ít nhất 6 ký tự');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new BadRequestError('Yêu cầu không hợp lệ');
    }

    // Exception flow 5.1: OTP đã hết hạn
    if (!user.verifyOTP(otp)) {
        // Check if OTP exists but expired
        if (user.resetPasswordOTP && user.resetPasswordOTP.code === otp) {
            throw new BadRequestError('Mã OTP đã hết hạn. Vui lòng nhấn nút "Gửi lại OTP" để nhận mã mới');
        }
        throw new BadRequestError('Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại hoặc yêu cầu mã mới');
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.resetPasswordOTP = undefined; // Clear OTP after successful verification
    await user.save();

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