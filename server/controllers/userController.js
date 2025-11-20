import userService from '../services/userService.js';
import { StatusCodes } from 'http-status-codes';

// @desc    Cập nhật profile (thông tin cá nhân + địa chỉ)
// @route   PATCH /api/v1/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  
  const updatedUser = await userService.updateProfile(userId, req.body);
  
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
  
  const user = await userService.getProfile(userId);
  
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
  
  await userService.changePassword(userId, { currentPassword, newPassword, confirmPassword });
  
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
    const userId = req.user?.userId;
    const file = req.file;
    
    const updatedUser = await userService.uploadAvatar(userId, file);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

// ========== ADMIN USER MANAGEMENT ==========

// @desc    Danh sách người dùng (Admin)
// @route   GET /api/v1/users/admin
// @access  Private (admin)
export const getAllUsers = async (req, res) => {
  const currentUserId = req.user.userId;
  
  const result = await userService.getAllUsers(req.query, currentUserId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: result
  });
};

// @desc    Lấy chi tiết 1 user (Admin)
// @route   GET /api/v1/users/admin/:id
// @access  Private (admin)
export const getUserByIdAdmin = async (req, res) => {
  const { id } = req.params;

  const user = await userService.getUserByIdAdmin(id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: { user }
  });
};

// @desc    Admin cập nhật thông tin user / role / trạng thái
// @route   PUT /api/v1/users/admin/:id
// @access  Private (admin)
export const updateUserByAdmin = async (req, res) => {
  const { id } = req.params;

  const updatedUser = await userService.updateUserByAdmin(id, req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cập nhật người dùng thành công',
    data: { user: updatedUser }
  });
};

// @desc    Xóa user (Admin)
// @route   DELETE /api/v1/users/admin/:id
// @access  Private (admin)
export const deleteUserByAdmin = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.userId;

  await userService.deleteUserByAdmin(id, currentUserId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Người dùng đã được xóa thành công'
  });
};