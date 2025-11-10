import express from 'express';
import { createReview, getReviewsByProduct, updateReview, checkReviewStatus } from '../controllers/reviewController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

// ✅ Kiểm tra trạng thái review cho sản phẩm (đã mua chưa, đã review chưa)
router.get("/check-status/:productId", authenticateUser, checkReviewStatus);

// 📌 Lấy danh sách review theo productId (public)
router.get('/:productId', getReviewsByProduct);

// 📝 Tạo mới review (chỉ khi đã đăng nhập)
router.post('/', authenticateUser, createReview);

// ✏️ Cập nhật review của chính người dùng
router.put('/:id', authenticateUser, updateReview);

export default router;