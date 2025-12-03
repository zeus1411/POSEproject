import User from '../models/User.js';
import { BadRequestError, UnauthenticatedError } from '../utils/errorHandler.js';
import { attachCookiesToResponse, createTokenUser } from '../middlewares/auth.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * Auth Service
 * Contains all business logic for authentication operations
 */

class AuthService {
  /**
   * Register new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} User with token
   */
  async register(userData) {
    const { email, username } = userData;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new BadRequestError('Email already exists');
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      throw new BadRequestError('Username already exists');
    }

    const user = await User.create(userData);
    return user;
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object
   */
  async login(email, password) {
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

    return user;
  }

  /**
   * Get current authenticated user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getCurrentUser(userId) {
    const user = await User.findOne({ _id: userId })
      .select('-password')
      .populate({
        path: 'address',
        select: 'fullName phoneNumber addressLine1 addressLine2 city district ward isDefault'
      });
    
    if (!user) {
      throw new UnauthenticatedError('User not found');
    }
    
    return user;
  }

  /**
   * Send OTP to user's email for password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Result with email and expiry time
   */
  async sendOTP(email) {
    if (!email) {
      throw new BadRequestError('Vui lòng cung cấp email');
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      throw new BadRequestError('Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại email');
    }

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

      return { email, expiresIn: 5 };
    } catch (error) {
      user.resetPasswordOTP = undefined;
      await user.save({ validateBeforeSave: false });
      throw new Error('Không thể gửi email. Vui lòng thử lại sau');
    }
  }

  /**
   * Resend OTP to user's email
   * @param {string} email - User email
   * @returns {Promise<Object>} Result with expiry time
   */
  async resendOTP(email) {
    if (!email) {
      throw new BadRequestError('Vui lòng cung cấp email');
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      throw new BadRequestError('Email không tồn tại trong hệ thống');
    }

    if (user.resetPasswordOTP && user.resetPasswordOTP.expires) {
      const timeRemaining = new Date(user.resetPasswordOTP.expires) - new Date();
      if (timeRemaining > 4 * 60 * 1000) {
        const minutesLeft = Math.ceil(timeRemaining / 60000);
        throw new BadRequestError(`Mã OTP hiện tại vẫn còn hiệu lực. Vui lòng đợi ${minutesLeft} phút trước khi yêu cầu mã mới`);
      }
    }

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

      return { expiresIn: 5 };
    } catch (error) {
      user.resetPasswordOTP = undefined;
      await user.save({ validateBeforeSave: false });
      throw new Error('Không thể gửi email. Vui lòng thử lại sau');
    }
  }

  /**
   * Verify OTP and reset password
   * @param {Object} resetData - { email, otp, newPassword, confirmPassword }
   * @returns {Promise<Object>} User object
   */
  async verifyOTPAndResetPassword(resetData) {
    const { email, otp, newPassword, confirmPassword } = resetData;

    if (!email || !otp || !newPassword || !confirmPassword) {
      throw new BadRequestError('Vui lòng cung cấp đầy đủ thông tin: email, OTP, mật khẩu mới và xác nhận mật khẩu');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Mật khẩu và xác nhận mật khẩu không khớp. Vui lòng nhập lại');
    }

    if (newPassword.length < 6) {
      throw new BadRequestError('Mật khẩu phải có ít nhất 6 ký tự');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError('Yêu cầu không hợp lệ');
    }

    if (!user.verifyOTP(otp)) {
      if (user.resetPasswordOTP && user.resetPasswordOTP.code === otp) {
        throw new BadRequestError('Mã OTP đã hết hạn. Vui lòng nhấn nút "Gửi lại OTP" để nhận mã mới');
      }
      throw new BadRequestError('Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại hoặc yêu cầu mã mới');
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    await user.save();

    return user;
  }
}

// Export singleton instance
export default new AuthService();
