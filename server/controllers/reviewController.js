import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

/**
 * @desc    Tạo mới đánh giá sản phẩm
 * @route   POST /api/reviews
 * @access  Private (chỉ user đã mua hàng)
 */
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment, title } = req.body;
    const userId = req.user.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Vui lòng chọn số sao hợp lệ (1–5).' });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ message: 'Nội dung đánh giá phải có ít nhất 10 ký tự.' });
    }

    // Kiểm tra người dùng đã mua sản phẩm này chưa
    const order = await Order.findOne({
      userId,
      'items.productId': productId,
      status: 'COMPLETED'
    });

    if (!order) {
      return res.status(400).json({ message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua.' });
    }

    // Kiểm tra đã có đánh giá chưa
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi.' });
    }

    // Tạo review
    const review = await Review.create({
      productId,
      userId,
      orderId: order._id,
      rating,
      comment,
      title,
      isVerifiedPurchase: true,
      status: 'APPROVED' // tạm thời auto duyệt, sau này có thể đổi sang PENDING
    });

    // Cập nhật rating trung bình cho sản phẩm
    const product = await Product.findById(productId);
    if (product && product.updateRating) {
      await product.updateRating();
    }

    res.status(201).json({
      message: 'Gửi đánh giá thành công!',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Không thể gửi đánh giá. Vui lòng thử lại sau.' });
  }
};

/**
 * @desc    Lấy danh sách review của sản phẩm
 * @route   GET /api/reviews/:productId
 * @access  Public
 */
export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ productId, status: 'APPROVED' })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const count = await Review.countDocuments({ productId, status: 'APPROVED' });

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Không thể tải danh sách đánh giá.' });
  }
};

/**
 * @desc    Cập nhật review (nếu cho phép)
 * @route   PUT /api/reviews/:id
 * @access  Private (chủ sở hữu)
 */
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, title } = req.body;
    const userId = req.user.userId;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá.' });
    }

    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa đánh giá này.' });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (title) review.title = title;
    review.isEdited = true;
    review.editedAt = new Date();

    await review.save();

    res.json({ message: 'Cập nhật đánh giá thành công.', review });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Không thể cập nhật đánh giá.' });
  }
};

// /**
//  * @desc    Kiểm tra xem user đã mua sản phẩm chưa
//  * @route   GET /api/reviews/check/:productId
//  * @access  Private
//  */
// export const checkPurchased = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { productId } = req.params;

//     const order = await Order.findOne({
//       userId,
//       'items.productId': productId,
//       status: 'COMPLETED'
//     });

//     res.json({ purchased: !!order });
//   } catch (error) {
//     console.error('Check purchase error:', error);
//     res.status(500).json({ message: 'Không thể kiểm tra lịch sử mua hàng.' });
//   }
// };

/**
 * @desc    Kiểm tra xem user đã mua VÀ đã review sản phẩm chưa
 * @route   GET /api/reviews/check-status/:productId
 * @access  Private
 */
export const checkReviewStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    // 1. Kiểm tra đã mua chưa
    const order = await Order.findOne({
      userId,
      'items.productId': productId,
      status: 'COMPLETED'
    });

    // 2. Kiểm tra đã review chưa
    const existingReview = await Review.findOne({ userId, productId });

    res.json({ 
      purchased: !!order, 
      hasReviewed: !!existingReview 
    });

  } catch (error) {
    console.error('Check review status error:', error);
    res.status(500).json({ message: 'Không thể kiểm tra trạng thái đánh giá.' });
  }
};