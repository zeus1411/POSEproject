import reviewService from '../services/reviewService.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';

/**
 * @desc    Tạo mới đánh giá sản phẩm
 * @route   POST /api/reviews
 * @access  Private (chỉ user đã mua hàng)
 */
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment, title, orderId } = req.body;
    const userId = req.user.userId;

    const review = await reviewService.createReview(userId, { productId, rating, comment, title, orderId });

    res.status(201).json({
      message: 'Gửi đánh giá thành công!',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.' });
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

    const result = await reviewService.getReviewsByProduct(productId, { page, limit });

    res.json(result);
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

/**
 * @desc    Kiểm tra trạng thái review cho từng sản phẩm trong order
 * @route   GET /api/reviews/check-order-status/:orderId
 * @access  Private
 */
export const checkOrderReviewStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const Order = (await import('../models/Order.js')).default;
    const Review = (await import('../models/Review.js')).default;

    // Lấy order
    const order = await Order.findOne({
      _id: orderId,
      userId
    }).populate('items.productId', '_id name');

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra review status cho từng sản phẩm
    const reviewStatus = {};
    
    for (const item of order.items) {
      const productId = item.productId._id.toString();
      const existingReview = await Review.findOne({ 
        userId, 
        productId, 
        orderId 
      });
      
      reviewStatus[productId] = {
        hasReviewed: !!existingReview,
        reviewId: existingReview?._id,
        productName: item.productId.name
      };
    }

    res.json({
      orderId,
      orderStatus: order.status,
      canReview: order.status === 'COMPLETED',
      reviewStatus
    });

  } catch (error) {
    console.error('Check order review status error:', error);
    res.status(500).json({ message: 'Không thể kiểm tra trạng thái đánh giá.' });
  }
};