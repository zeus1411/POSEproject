import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../utils/errorHandler.js';

// @desc    Lấy giỏ hàng của user
// @route   GET /api/cart
// @access  Private (User)
const getCart = async (req, res) => {
  const userId = req.user.userId;

  let cart = await Cart.findOne({ userId }).populate({
    path: 'items.productId',
    select: 'name price salePrice discount images sku stock status'
  });

  // Tạo giỏ hàng mới nếu chưa có
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  // Tính tổng giá trị giỏ hàng
  let totalItems = 0;
  let subtotal = 0;

  const validItems = cart.items.filter(item => {
    // Bỏ các sản phẩm không còn tồn tại hoặc không còn ACTIVE
    if (!item.productId || item.productId.status !== 'ACTIVE') {
      return false;
    }

    const itemPrice = item.productId.salePrice || item.productId.price;
    const itemDiscount = item.productId.discount || 0;
    const itemTotal = itemPrice * item.quantity * (1 - itemDiscount / 100);

    totalItems += item.quantity;
    subtotal += itemTotal;

    return true;
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      cart: {
        ...cart.toObject(),
        items: validItems
      },
      summary: {
        totalItems,
        subtotal,
        shippingFee: subtotal >= 500000 ? 0 : 30000,
        total: subtotal + (subtotal >= 500000 ? 0 : 30000)
      }
    }
  });
};

// @desc    Thêm sản phẩm vào giỏ hàng
// @route   POST /api/cart/items
// @access  Private (User)
const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user.userId;

  if (!productId) {
    throw new BadRequestError('Vui lòng cung cấp ID sản phẩm');
  }

  if (quantity < 1) {
    throw new BadRequestError('Số lượng phải lớn hơn 0');
  }

  // Kiểm tra sản phẩm tồn tại
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new NotFoundError('Không tìm thấy sản phẩm');
  }

  // CHECK UPDATED: dùng status thay vì isActive
  if (product.status !== 'ACTIVE') {
    throw new BadRequestError('Sản phẩm hiện không khả dụng');
  }

  if (product.stock < quantity) {
    throw new BadRequestError(
      `Sản phẩm chỉ còn ${product.stock} sản phẩm trong kho`
    );
  }

  // Lấy hoặc tạo giỏ hàng
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [{ productId, quantity }]
    });
  } else {
    // Kiểm tra nếu sản phẩm đã có trong giỏ -> cộng dồn số lượng
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (newQuantity > product.stock) {
        throw new BadRequestError(
          `Sản phẩm chỉ còn ${product.stock} sản phẩm trong kho`
        );
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ productId, quantity });
    }
  }

  await cart.save();

  // Populate để trả về thông tin đầy đủ
  await cart.populate({
    path: 'items.productId',
    select: 'name price salePrice discount images sku stock status'
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã thêm sản phẩm vào giỏ hàng',
    data: { cart }
  });
};

// @desc    Cập nhật số lượng sản phẩm trong giỏ
// @route   PATCH /api/cart/items/:productId
// @access  Private (User)
const updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.userId;

  if (quantity < 1) {
    throw new BadRequestError('Số lượng phải lớn hơn 0');
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new NotFoundError('Không tìm thấy giỏ hàng');
  }

  const itemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw new NotFoundError('Không tìm thấy sản phẩm trong giỏ hàng');
  }

  // Kiểm tra tồn kho
  const product = await Product.findById(productId);
  
  // UPDATED CHECK: dùng status
  if (!product || product.status !== 'ACTIVE') {
    throw new BadRequestError('Sản phẩm không khả dụng');
  }

  if (quantity > product.stock) {
    throw new BadRequestError(
      `Sản phẩm chỉ còn ${product.stock} sản phẩm trong kho`
    );
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  await cart.populate({
    path: 'items.productId',
    select: 'name price salePrice discount images sku stock status'
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã cập nhật số lượng sản phẩm',
    data: { cart }
  });
};

// @desc    Xóa sản phẩm khỏi giỏ hàng
// @route   DELETE /api/cart/items/:productId
// @access  Private (User)
const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.userId;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new NotFoundError('Không tìm thấy giỏ hàng');
  }

  cart.items = cart.items.filter(
    item => item.productId.toString() !== productId
  );

  await cart.save();

  await cart.populate({
    path: 'items.productId',
    select: 'name price salePrice discount images sku stock status'
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã xóa sản phẩm khỏi giỏ hàng',
    data: { cart }
  });
};

// @desc    Xóa toàn bộ giỏ hàng
// @route   DELETE /api/cart
// @access  Private (User)
const clearCart = async (req, res) => {
  const userId = req.user.userId;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new NotFoundError('Không tìm thấy giỏ hàng');
  }

  cart.items = [];
  await cart.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã xóa toàn bộ giỏ hàng'
  });
};

// @desc    Kiểm tra giỏ hàng trước khi thanh toán
// @route   POST /api/cart/validate
// @access  Private (User)
const validateCart = async (req, res) => {
  const userId = req.user.userId;

  const cart = await Cart.findOne({ userId }).populate({
    path: 'items.productId',
    select: 'name price salePrice discount images sku stock status'
  });

  if (!cart || cart.items.length === 0) {
    throw new BadRequestError('Giỏ hàng trống');
  }

  const issues = [];
  const validItems = [];

  for (const item of cart.items) {
    const product = item.productId;

    if (!product) {
      issues.push({
        productId: item.productId,
        message: 'Sản phẩm không tồn tại'
      });
      continue;
    }

    // UPDATED CHECK: dùng status
    if (product.status !== 'ACTIVE') {
      issues.push({
        productId: product._id,
        productName: product.name,
        message: 'Sản phẩm hiện không khả dụng'
      });
      continue;
    }

    if (product.stock < item.quantity) {
      issues.push({
        productId: product._id,
        productName: product.name,
        message: `Chỉ còn ${product.stock} sản phẩm trong kho, bạn đang chọn ${item.quantity}`
      });
      continue;
    }

    validItems.push(item);
  }

  const isValid = issues.length === 0;

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      isValid,
      updatedCart: {
        ...cart.toObject(),
        items: validItems
      },
      issues,
      validItemsCount: validItems.length,
      totalItemsCount: cart.items.length
    }
  });
};

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart
};
