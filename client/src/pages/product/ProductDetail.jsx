import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProductById, clearCurrentProduct } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import ReviewForm from '../../components/review/ReviewForm';
import { fetchReviews } from "../../redux/slices/reviewSlice";
import ReviewCard from '../../components/review/ReviewCard';  
import ReviewList from '../../components/review/ReviewList';
import { checkReviewStatus } from "../../redux/slices/reviewSlice";
import ProductVariantSelector from '../../components/common/ProductVariantSelector';

import { 
  StarIcon, 
  HeartIcon, 
  ShoppingCartIcon, 
  MinusIcon, 
  PlusIcon,
  ArrowLeftIcon,
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, isLoading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart); // Add cart from state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const reviews = useSelector((state) => state.reviews);

  useEffect(() => {
    if (id) {
      dispatch(getProductById(id));
      dispatch(fetchReviews(id));
      if (user) dispatch(checkReviewStatus(id)); // ✅ nếu đăng nhập mới check
    }
    
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id, user]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="w-5 h-5 text-yellow-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      );
    }

    return stars;
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    const maxStock = availableStock; // Use available stock instead of current stock
    
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const location = useLocation();
  
  const handleAddToCart = async () => {
    if (!user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirect || '/shop'}`);
      return;
    }

    // Check if product has variants and user selected one
    if (currentProduct?.hasVariants && !selectedVariant) {
      alert('Vui lòng chọn biến thể sản phẩm');
      return;
    }

    try {
      const cartData = {
        productId: currentProduct._id,
        quantity
      };

      // Add variantId if product has variants
      if (currentProduct?.hasVariants && selectedVariant) {
        cartData.variantId = selectedVariant._id;
      }

      await dispatch(addToCart(cartData)).unwrap();
      // Reset quantity after successful add
      setQuantity(1);
    } catch (error) {
      alert(error || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1); // Reset quantity when variant changes
  };

  // Get current price and stock based on variant selection
  const getCurrentPrice = () => {
    if (currentProduct?.hasVariants && selectedVariant) {
      return selectedVariant.price;
    }
    return currentProduct?.price || 0;
  };

  const getCurrentStock = () => {
    if (currentProduct?.hasVariants && selectedVariant) {
      return selectedVariant.stock;
    }
    return currentProduct?.stock || 0;
  };
  
  // Get available stock (stock - quantity in cart)
  const getAvailableStock = () => {
    let currentStock = getCurrentStock();
    
    // Find matching item in cart
    if (cart && cart.items) {
      const cartItem = cart.items.find(item => {
        if (item.productId._id !== currentProduct._id) return false;
        
        // If has variants, must match variant too
        if (currentProduct?.hasVariants && selectedVariant) {
          return item.variantId === selectedVariant._id;
        }
        
        return true;
      });
      
      if (cartItem) {
        currentStock -= cartItem.quantity;
      }
    }
    
    return Math.max(0, currentStock);
  };

  const handleToggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
  };

  const currentPrice = getCurrentPrice();
  const currentStock = getCurrentStock();
  const availableStock = getAvailableStock(); // Available stock after cart quantity

  const discountPercentage = currentProduct?.originalPrice && currentPrice 
    ? Math.round(((currentProduct.originalPrice - currentPrice) / currentProduct.originalPrice) * 100)
    : currentProduct?.discount || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h2>
          <button
            onClick={() => navigate('/shop')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => navigate('/shop')}
              className="hover:text-primary-600 transition-colors duration-200"
            >
              Cửa hàng
            </button>
            <span>/</span>
            <span className="text-gray-900">{currentProduct.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200">
              <img
                src={currentProduct.images?.[selectedImageIndex] || '/placeholder-product.jpg'}
                alt={currentProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg';
                }}
              />
            </div>

            {/* Thumbnail Images */}
            {currentProduct.images && currentProduct.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                      selectedImageIndex === index 
                        ? 'border-primary-600' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${currentProduct.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentProduct.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {renderStars(currentProduct.rating?.average || 0)}
                </div>
                <span className="text-sm text-gray-600">
                  ({currentProduct.rating?.count || 0} đánh giá)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(currentPrice)}
                </span>
                {currentProduct.originalPrice && currentProduct.originalPrice > currentPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(currentProduct.originalPrice)}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-3 h-3 rounded-full ${
                  availableStock > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {availableStock > 0 ? `Còn ${availableStock} sản phẩm` : 'Hết hàng'}
                </span>
                {currentStock > availableStock && (
                  <span className="text-xs text-blue-600">
                    ({currentStock - availableStock} trong giỏ hàng)
                  </span>
                )}
              </div>
            </div>

            {/* Variant Selector */}
            <ProductVariantSelector
              product={currentProduct}
              selectedVariant={selectedVariant}
              onVariantChange={handleVariantChange}
            />

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border border-gray-300 rounded-md min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= availableStock}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Warning message if variants not selected */}
                {currentProduct?.hasVariants && !selectedVariant && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ Vui lòng chọn biến thể sản phẩm trước khi thêm vào giỏ hàng
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={availableStock === 0 || (currentProduct?.hasVariants && !selectedVariant)}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    {availableStock === 0 
                      ? 'Hết hàng' 
                      : currentProduct?.hasVariants && !selectedVariant
                      ? 'Chọn biến thể'
                      : 'Thêm vào giỏ hàng'}
                  </button>
                  
                  <button
                    onClick={handleToggleWishlist}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    {isInWishlist ? (
                      <HeartSolidIcon className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-gray-600" />
                    )}
                  </button>

                  <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <ShareIcon className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <TruckIcon className="w-6 h-6 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Miễn phí vận chuyển</p>
                  <p className="text-xs text-gray-500">Cho đơn hàng từ 500k</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Bảo hành chính hãng</p>
                  <p className="text-xs text-gray-500">12 tháng</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <ArrowPathIcon className="w-6 h-6 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Đổi trả 30 ngày</p>
                  <p className="text-xs text-gray-500">Miễn phí</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {currentProduct.description}
            </p>
          </div>
        </div>

        {/* Specifications */}
        {currentProduct.specifications && Object.keys(currentProduct.specifications).length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông số kỹ thuật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentProduct.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">{key}</span>
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Đánh giá sản phẩm */}
        <div className="mt-12 bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Đánh giá sản phẩm</h2>

          {/* Form gửi đánh giá */}
          {user && reviews.purchased && !reviews.hasReviewed && (
            <ReviewForm productId={currentProduct._id} />
          )}

          {user && reviews.purchased && reviews.hasReviewed && (
            <p className="text-gray-500 mb-4">
              Bạn đã gửi đánh giá cho sản phẩm này rồi. Cảm ơn bạn!
            </p>
          )}

          {user && !reviews.purchased && (
            <p className="text-gray-500 mb-4">
              Bạn chỉ có thể gửi đánh giá sau khi đã mua sản phẩm này.
            </p>
          )}

          {/* Danh sách đánh giá */}
          <ReviewList productId={currentProduct._id} />
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;