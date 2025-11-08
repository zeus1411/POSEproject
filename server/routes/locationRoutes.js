import express from 'express';
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards
} from '../controllers/locationController.js';

const router = express.Router();

// Tất cả routes đều public (không cần auth)

// Lấy danh sách tỉnh/thành phố
router.get('/provinces', fetchProvinces);

// Lấy danh sách quận/huyện theo tỉnh
router.get('/districts/:provinceId', fetchDistricts);

// Lấy danh sách phường/xã theo quận
router.get('/wards/:districtId', fetchWards);

export default router;