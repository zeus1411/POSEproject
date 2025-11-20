import addressService from '../services/addressService.js';
import { StatusCodes } from 'http-status-codes';

// @desc    Lấy tất cả địa chỉ của user
// @route   GET /api/v1/addresses
// @access  Private
export const getUserAddresses = async (req, res) => {
  const userId = req.user.userId;
  
  const addresses = await addressService.getUserAddresses(userId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { addresses }
  });
};

// @desc    Lấy địa chỉ mặc định
// @route   GET /api/v1/addresses/default
// @access  Private
export const getDefaultAddress = async (req, res) => {
  const userId = req.user.userId;
  
  const address = await addressService.getDefaultAddress(userId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { address }
  });
};

// @desc    Lấy chi tiết 1 địa chỉ
// @route   GET /api/v1/addresses/:id
// @access  Private
export const getAddressById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  const address = await addressService.getAddressById(id, userId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { address }
  });
};

// @desc    Tạo địa chỉ mới
// @route   POST /api/v1/addresses
// @access  Private
export const createAddress = async (req, res) => {
  const userId = req.user.userId;
  
  const address = await addressService.createAddress(userId, req.body);
  
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Thêm địa chỉ thành công',
    data: { address }
  });
};

// @desc    Cập nhật địa chỉ
// @route   PATCH /api/v1/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  const address = await addressService.updateAddress(id, userId, req.body);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cập nhật địa chỉ thành công',
    data: { address }
  });
};

// @desc    Xóa địa chỉ
// @route   DELETE /api/v1/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  await addressService.deleteAddress(id, userId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Xóa địa chỉ thành công'
  });
};

// @desc    Đặt địa chỉ mặc định
// @route   PATCH /api/v1/addresses/:id/set-default
// @access  Private
export const setDefaultAddress = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  const address = await addressService.setDefaultAddress(id, userId);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã đặt làm địa chỉ mặc định',
    data: { address }
  });
};

export default {
  getUserAddresses,
  getDefaultAddress,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};