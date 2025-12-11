import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errorHandler.js';

/**
 * Review Service
 * Contains all business logic for review operations
 */

class ReviewService {
  /**
   * Create new review
   * @param {string} userId - User ID
   * @param {Object} reviewData - { productId, rating, comment, title, orderId }
   * @returns {Promise<Object>} Created review
   */
  async createReview(userId, reviewData) {
    const { productId, rating, comment, title, orderId } = reviewData;

    if (!rating || rating < 1 || rating > 5) {
      throw new BadRequestError('Vui lòng chọn số sao hợp lệ (1–5).');
    }

    if (!comment || comment.trim().length < 10) {
      throw new BadRequestError('Nội dung đánh giá phải có ít nhất 10 ký tự.');
    }

    let finalOrderId = orderId;
    
    // If orderId is provided, verify it
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        userId,
        'items.productId': productId,
        status: 'COMPLETED'
      });

      if (!order) {
        throw new BadRequestError('Đơn hàng không hợp lệ hoặc chưa hoàn thành.');
      }
      
      // Check if already reviewed for this order
      const existingReview = await Review.findOne({ userId, productId, orderId });
      if (existingReview) {
        throw new BadRequestError('Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi.');
      }
    } else {
      // If no orderId provided, find completed orders and pick one that hasn't been reviewed
      const completedOrders = await Order.find({
        userId,
        'items.productId': productId,
        status: 'COMPLETED'
      }).select('_id').lean();

      if (!completedOrders || completedOrders.length === 0) {
        throw new BadRequestError('Bạn chỉ có thể đánh giá sản phẩm đã mua.');
      }
      
      // Find an order that hasn't been reviewed yet
      let unreviewedOrder = null;
      for (const order of completedOrders) {
        const existingReview = await Review.findOne({ 
          userId, 
          productId, 
          orderId: order._id 
        });
        
        if (!existingReview) {
          unreviewedOrder = order;
          break;
        }
      }
      
      if (!unreviewedOrder) {
        throw new BadRequestError('Bạn đã đánh giá sản phẩm này cho tất cả các đơn hàng.');
      }
      
      finalOrderId = unreviewedOrder._id;
    }

    // Create review
    const review = await Review.create({
      productId,
      userId,
      orderId: finalOrderId,
      rating,
      comment,
      title,
      isVerifiedPurchase: true,
      status: 'APPROVED' // auto approve, can change to PENDING later
    });

    // Update product rating
    const product = await Product.findById(productId);
    if (product && product.updateRating) {
      await product.updateRating();
    }

    return review;
  }

  /**
   * Get reviews by product
   * @param {string} productId - Product ID
   * @param {Object} pagination - { page, limit }
   * @returns {Promise<Object>} Reviews with pagination
   */
  async getReviewsByProduct(productId, pagination) {
    const { page = 1, limit = 10 } = pagination;

    const reviews = await Review.find({ productId, status: 'APPROVED' })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const count = await Review.countDocuments({ productId, status: 'APPROVED' });

    return {
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page)
    };
  }

  /**
   * Update review
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID (for ownership check)
   * @param {Object} updateData - { rating, comment, title }
   * @returns {Promise<Object>} Updated review
   */
  async updateReview(reviewId, userId, updateData) {
    const { rating, comment, title } = updateData;

    const review = await Review.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Không tìm thấy đánh giá.');
    }

    if (review.userId.toString() !== userId.toString()) {
      throw new UnauthorizedError('Bạn không có quyền chỉnh sửa đánh giá này.');
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (title) review.title = title;
    review.isEdited = true;
    review.editedAt = new Date();

    await review.save();
    return review;
  }

  /**
   * Check review status for a product
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} { purchased, hasReviewed }
   */
  async checkReviewStatus(userId, productId) {
    // Check if purchased
    const order = await Order.findOne({
      userId,
      'items.productId': productId,
      status: 'COMPLETED'
    });

    // Check if reviewed
    const existingReview = await Review.findOne({ userId, productId });

    return { 
      purchased: !!order, 
      hasReviewed: !!existingReview 
    };
  }
}

// Export singleton instance
export default new ReviewService();
