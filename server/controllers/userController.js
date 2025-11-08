import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../utils/errorHandler.js';

// @desc    Cập nhật profile (thông tin cá nhân + địa chỉ)
// @route   PATCH /api/v1/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  
  const user = await User.findById(userId);
  
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }
  
  // Các field được phép update
  const allowedPersonalFields = [
    'fullName',
    'phone',
    'dateOfBirth',
    'gender'
  ];
  
  // Update personal info
  allowedPersonalFields.forEach(field => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  
  // Update address (nếu có)
  if (req.body.address) {
    const allowedAddressFields = [
      'street',
      'ward',
      'wardCode',
      'district',
      'districtId',
      'city',
      'cityId',
      'country',
      'postalCode',
      'notes'
    ];
    
    if (!user.address) {
      user.address = {};
    }
    
    allowedAddressFields.forEach(field => {
      if (req.body.address[field] !== undefined) {
        user.address[field] = req.body.address[field];
      }
    });
  }
  
  await user.save();
  
  // Trả về user (không bao gồm password)
  const updatedUser = await User.findById(userId).select('-password');
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cập nhật thông tin thành công',
    data: { user: updatedUser }
  });
};

// @desc    Lấy thông tin profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  const userId = req.user.userId;
  
  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { user }
  });
};

// @desc    Đổi mật khẩu
// @route   PATCH /api/v1/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
  }
  
  if (newPassword !== confirmPassword) {
    throw new BadRequestError('Mật khẩu mới không khớp');
  }
  
  if (newPassword.length < 6) {
    throw new BadRequestError('Mật khẩu phải có ít nhất 6 ký tự');
  }
  
  // Lấy user kèm password
  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }
  
  // Kiểm tra mật khẩu hiện tại
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  
  if (!isPasswordCorrect) {
    throw new BadRequestError('Mật khẩu hiện tại không đúng');
  }
  
  // Cập nhật mật khẩu mới
  user.password = newPassword;
  await user.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đổi mật khẩu thành công'
  });
};

export default {
  updateProfile,
  getProfile,
  changePassword
};