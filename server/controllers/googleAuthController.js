import { OAuth2Client } from 'google-auth-library';
import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import { attachCookiesToResponse } from '../utils/jwt.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Đăng nhập/Đăng ký bằng Google
 * @route   POST /api/v1/auth/google
 * @access  Public
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    // Kiểm tra xem email đã tồn tại chưa
    let user = await User.findOne({ email });

    if (user) {
      // Nếu user đã tồn tại nhưng KHÔNG phải tài khoản Google
      if (!user.googleId) {
        return res.status(StatusCodes.CONFLICT).json({
          success: false,
          message: 'Email này đã được đăng ký bằng tài khoản thường. Vui lòng đăng nhập bằng email và mật khẩu hoặc sử dụng email khác.',
        });
      }

      // Nếu đã là tài khoản Google → Đăng nhập
      const { token, tokenUser } = attachCookiesToResponse(res, user);
      
      return res.status(StatusCodes.OK).json({
        success: true,
        user: tokenUser,
        token,
        message: 'Đăng nhập Google thành công',
      });
    }

    // Nếu chưa tồn tại → Tạo tài khoản mới
    user = await User.create({
      email,
      username: name || email.split('@')[0],
      googleId,
      avatar: picture,
      password: 'GOOGLE_AUTH_' + Math.random().toString(36), // Random password vì không cần
      isVerified: true, // Google đã verify email rồi
    });

    const { token, tokenUser } = attachCookiesToResponse(res, user);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      user: tokenUser,
      token,
      message: 'Đăng ký Google thành công',
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    
    if (error.message?.includes('Token used too late')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Token đã hết hạn. Vui lòng thử lại.',
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Đăng nhập Google thất bại. Vui lòng thử lại.',
    });
  }
};
