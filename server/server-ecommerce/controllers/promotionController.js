import promotionService from '../services/promotionService.js';
import { StatusCodes } from 'http-status-codes';
import { broadcastPromotionToCustomers } from '../../config/socket.js';
import User from '../models/User.js';
import Promotion from '../models/Promotion.js';

// ==================== ADMIN CONTROLLERS ====================

/**
 * @desc    Create new promotion
 * @route   POST /api/v1/promotions
 * @access  Private/Admin
 */
export const createPromotion = async (req, res, next) => {
  try {
    const promotion = await promotionService.createPromotion(req.body, req.user.userId);

    // 🎁 Broadcast promotion to all customers via Socket.io
    if (promotion.isActive && promotion.promotionType === 'COUPON') {
      broadcastPromotionToCustomers(promotion);
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: promotion,
      message: 'Tạo chương trình khuyến mãi thành công'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all coupons
 * @route   GET /api/v1/promotions
 * @access  Private/Admin
 */
export const getAllPromotions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isActive, search } = req.query;

    const filters = {};
    // Only add filters if they have actual values (not empty strings)
    if (isActive !== undefined && isActive !== '') {
      filters.isActive = isActive === 'true';
    }
    // Always filter for COUPON type only
    filters.promotionType = 'COUPON';
    
    if (search && search.trim() !== '') {
      filters.search = search.trim();
    }

    const result = await promotionService.getAllPromotions(filters, Number(page), Number(limit));

    res.status(StatusCodes.OK).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get promotion by ID
 * @route   GET /api/v1/promotions/:id
 * @access  Private/Admin
 */
export const getPromotionById = async (req, res, next) => {
  try {
    const promotion = await promotionService.getPromotionById(req.params.id);

    res.status(StatusCodes.OK).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update promotion
 * @route   PUT /api/v1/promotions/:id
 * @access  Private/Admin
 */
export const updatePromotion = async (req, res, next) => {
  try {
    const promotion = await promotionService.updatePromotion(
      req.params.id,
      req.body,
      req.user.userId
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: promotion,
      message: 'Cập nhật chương trình khuyến mãi thành công'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete promotion
 * @route   DELETE /api/v1/promotions/:id
 * @access  Private/Admin
 */
export const deletePromotion = async (req, res, next) => {
  try {
    const result = await promotionService.deletePromotion(req.params.id);

    res.status(StatusCodes.OK).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle promotion status
 * @route   PATCH /api/v1/promotions/:id/toggle
 * @access  Private/Admin
 */
export const togglePromotionStatus = async (req, res, next) => {
  try {
    const promotion = await promotionService.togglePromotionStatus(req.params.id);

    res.status(StatusCodes.OK).json({
      success: true,
      data: promotion,
      message: `Đã ${promotion.isActive ? 'kích hoạt' : 'tắt'} chương trình khuyến mãi`
    });
  } catch (error) {
    next(error);
  }
};

// ==================== USER CONTROLLERS ====================

/**
 * @desc    Get available promotions for user
 * @route   GET /api/v1/promotions/available
 * @access  Private
 */
export const getAvailablePromotions = async (req, res, next) => {
  try {
    const promotions = await promotionService.getAvailablePromotions(req.user.userId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: promotions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active coupons for dropdown (grouped by type)
 * @route   GET /api/v1/promotions/coupons/active
 * @access  Private
 */
export const getAllActiveCoupons = async (req, res, next) => {
  try {
    const coupons = await promotionService.getAllActiveCoupons();

    res.status(StatusCodes.OK).json({
      success: true,
      data: coupons
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get promotions for specific product
 * @route   GET /api/v1/promotions/product/:productId
 * @access  Public
 */
export const getPromotionsForProduct = async (req, res, next) => {
  try {
    const promotions = await promotionService.getPromotionsForProduct(req.params.productId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: promotions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check coupon eligibility (without applying)
 * @route   POST /api/v1/promotions/check-eligibility
 * @access  Private
 */
export const checkCouponEligibility = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Vui lòng nhập mã giảm giá'
      });
    }

    const result = await promotionService.checkCouponEligibility(
      code,
      req.user?.userId,
      cartTotal || 0
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Validate coupon code
 * @route   POST /api/v1/promotions/validate
 * @access  Private
 */
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, cart } = req.body;

    if (!code) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Vui lòng nhập mã giảm giá'
      });
    }

    const promotion = await promotionService.validateCoupon(code, req.user.userId, cart);

    // Calculate discount preview
    const { totalDiscount, appliedPromotions } = await promotionService.calculateDiscount(
      cart,
      [promotion],
      req.user.userId
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        promotion,
        discount: totalDiscount,
        appliedPromotions
      },
      message: 'Mã giảm giá hợp lệ'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Apply promotions to cart
 * @route   POST /api/v1/promotions/apply
 * @access  Private
 */
export const applyPromotions = async (req, res, next) => {
  try {
    const { cart, promotionIds } = req.body;

    // Get promotions
    const promotions = await Promise.all(
      promotionIds.map(id => promotionService.getPromotionById(id))
    );

    // Calculate discount
    const { totalDiscount, appliedPromotions } = await promotionService.calculateDiscount(
      cart,
      promotions,
      req.user.userId
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalDiscount,
        appliedPromotions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get promotion statistics (Admin)
 * @route   GET /api/v1/promotions/statistics
 * @access  Private/Admin
 */
export const getPromotionStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // This would be implemented based on your needs
    // For now, return basic stats

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        message: 'Statistics endpoint - to be implemented'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Auto-apply all applicable promotions to cart
 * @route   POST /api/v1/promotions/apply-to-cart
 * @access  Private
 */
export const applyPromotionsToCart = async (req, res, next) => {
  try {
    const { cart } = req.body;
    const userId = req.user.userId;

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
    }

    // Get all active promotions applicable to this cart
    const applicablePromotions = await promotionService.getApplicablePromotions(cart, userId);

    // Calculate total discount
    const { totalDiscount, appliedPromotions, breakdown } = await promotionService.calculateDiscount(
      cart,
      applicablePromotions,
      userId
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalDiscount,
        appliedPromotions,
        breakdown,
        availablePromotions: applicablePromotions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unviewed promotions for current user
 * @route   GET /api/v1/promotions/unviewed
 * @access  Private (Customer only)
 */
export const getUnviewedPromotions = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Lấy danh sách promotions đã xem của user
    const user = await User.findById(userId).select('viewedPromotions');
    const viewedIds = user?.viewedPromotions || [];

    // Lấy các promotions active, chưa xem, trong vòng 7 ngày gần đây
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const unviewedPromotions = await Promotion.find({
      _id: { $nin: viewedIds }, // Chưa xem
      isActive: true,
      promotionType: 'COUPON',
      createdAt: { $gte: sevenDaysAgo }, // Chỉ lấy promotions trong 7 ngày gần đây
      $or: [
        { endDate: { $exists: false } }, // Không có endDate
        { endDate: { $gte: new Date() } } // Hoặc chưa hết hạn
      ]
    })
      .sort({ createdAt: -1 })
      .limit(5); // Giới hạn 5 promotions mới nhất

    res.status(StatusCodes.OK).json({
      success: true,
      data: unviewedPromotions,
      count: unviewedPromotions.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark promotion as viewed
 * @route   POST /api/v1/promotions/:id/mark-viewed
 * @access  Private (Customer only)
 */
export const markPromotionAsViewed = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const promotionId = req.params.id;

    // Kiểm tra promotion có tồn tại không
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Không tìm thấy khuyến mãi'
      });
    }

    // Thêm promotion vào danh sách đã xem (nếu chưa có)
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { viewedPromotions: promotionId } }, // $addToSet tránh duplicate
      { new: true }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã đánh dấu đã xem'
    });
  } catch (error) {
    next(error);
  }
};

