import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { XMarkIcon, TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { updateCartItem, removeFromCart } from '../../redux/slices/cartSlice';

const MiniCart = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { cart, summary, loading } = useSelector((state) => state.cart);
  const miniCartRef = useRef(null);

  // Close mini cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (miniCartRef.current && !miniCartRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    
    try {
      await dispatch(updateCartItem({ productId, quantity: newQuantity })).unwrap();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const items = cart?.items || [];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" />
      )}

      {/* Mini Cart Sidebar */}
      <div
        ref={miniCartRef}
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Giỏ hàng ({summary.totalItems} sản phẩm)
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg
                  className="w-24 h-24 text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <p className="text-gray-500 text-lg mb-2">Giỏ hàng trống</p>
                <p className="text-gray-400 text-sm mb-4">Thêm sản phẩm để bắt đầu mua sắm</p>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  if (!item.productId) return null;
                  
                  const product = item.productId;
                  const price = product.salePrice || product.price;
                  const discount = product.discount || 0;
                  const finalPrice = price * (1 - discount / 100);

                  return (
                    <div
                      key={item._id}
                      className="flex gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {/* Product Image */}
                      <Link
                        to={`/product/${product._id}`}
                        onClick={onClose}
                        className="flex-shrink-0"
                      >
                        <img
                          src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${product._id}`}
                          onClick={onClose}
                          className="block"
                        >
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="mt-1">
                          <span className="text-sm font-semibold text-primary-600">
                            {formatPrice(finalPrice)}
                          </span>
                          {discount > 0 && (
                            <span className="ml-2 text-xs text-gray-500 line-through">
                              {formatPrice(price)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => handleUpdateQuantity(product._id, item.quantity, -1)}
                              disabled={item.quantity <= 1}
                              className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <MinusIcon className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(product._id, item.quantity, 1)}
                              disabled={item.quantity >= product.stock}
                              className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <PlusIcon className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(product._id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - Summary & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(summary.subtotal)}
                </span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium text-gray-900">
                  {summary.shippingFee === 0 ? (
                    <span className="text-green-600">Miễn phí</span>
                  ) : (
                    formatPrice(summary.shippingFee)
                  )}
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between text-base pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Tổng cộng:</span>
                <span className="font-bold text-primary-600 text-lg">
                  {formatPrice(summary.total)}
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                onClick={onClose}
                className="block w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-center font-semibold rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                Thanh toán
              </Link>

              {/* Continue Shopping */}
              <button
                onClick={onClose}
                className="block w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MiniCart;
