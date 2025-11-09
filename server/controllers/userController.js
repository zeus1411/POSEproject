import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError, UnauthenticatedError } from '../utils/errorHandler.js';

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

// @desc    Upload user avatar
// @route   PATCH /api/v1/users/avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Vui lòng tải lên ảnh đại diện');
    }

    console.log('Uploading avatar for user ID:', req.user?.userId);
    console.log('File path:', req.file.path);

    if (!req.user?.userId) {
      console.error('No user ID in request');
      throw new UnauthenticatedError('Không tìm thấy thông tin người dùng');
    }

    // First find the user to ensure they exist
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      console.error('User not found with ID:', req.user.userId);
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // Update the avatar field
    user.avatar = req.file.path;
    
    // Save the user document
    await user.save({ validateBeforeSave: false });

    // Get the updated user without the password field
    const updatedUser = await User.findById(user._id).select('-password');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Error in uploadAvatar:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      file: req.file
    });
    next(error);
  }
};

export default {
  updateProfile,
  getProfile,
  changePassword,
  uploadAvatar
};