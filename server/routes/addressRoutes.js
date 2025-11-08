import express from 'express';
import {
  getUserAddresses,
  getDefaultAddress,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/addressController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateUser);

// Lấy địa chỉ mặc định - ĐẶT TRƯỚC /:id
router.get('/default', getDefaultAddress);

// Lấy tất cả địa chỉ
router.get('/', getUserAddresses);

// Tạo địa chỉ mới
router.post('/', createAddress);

// Đặt địa chỉ mặc định - ĐẶT TRƯỚC /:id
router.patch('/:id/set-default', setDefaultAddress);

// Lấy chi tiết địa chỉ
router.get('/:id', getAddressById);

// Cập nhật địa chỉ
router.patch('/:id', updateAddress);

// Xóa địa chỉ
router.delete('/:id', deleteAddress);

export default router;