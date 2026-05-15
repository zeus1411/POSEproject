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
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

import { 
  StarIcon, 
  ShoppingCartIcon, 
  MinusIcon, 
  PlusIcon,
  ArrowLeftIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  // Get orderId and review flag from query params
  const searchParams = new URLSearchParams(location.search);
  const orderIdFromUrl = searchParams.get('orderId');
  const shouldShowReviewForm = searchParams.get('review') === 'true';
  
  const { currentProduct, isLoading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart); // Add cart from state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const reviews = useSelector((state) => state.reviews);
  const [showReviewForm, setShowReviewForm] = useState(false);

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

  // Auto scroll to review form if coming from order detail
  useEffect(() => {
    if (shouldShowReviewForm && orderIdFromUrl) {
      setShowReviewForm(true);
      // Scroll to review section after component renders
      setTimeout(() => {
        const reviewSection = document.getElementById('review-section');
        if (reviewSection) {
          reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [shouldShowReviewForm, orderIdFromUrl]);

  useEffect(() => {
    if (!currentProduct || !currentProduct.hasVariants) return;

    if (selectedVariant) return;

    // Try to find first available variant with stock
    const firstAvailable = currentProduct.variants.find(
      v => v.isActive && Number(v.stock) > 0
    );

    if (firstAvailable) {
      setSelectedVariant(firstAvailable);
    } else {
      // If all variants are out of stock, select first active variant to show price
      const firstActive = currentProduct.variants.find(v => v.isActive);
      setSelectedVariant(firstActive || null);
    }
  }, [currentProduct]);

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

  const handleAddToCart = async () => {
    if (!user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirect || '/shop'}`);
      return;
    }

    // Check if product has variants and user selected one
    if (currentProduct?.hasVariants && !selectedVariant) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn biến thể',
        text: 'Vui lòng chọn biến thể sản phẩm trước khi thêm vào giỏ hàng',
        confirmButtonColor: '#3b82f6'
      });
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
      Swal.fire({
        icon: 'error',
        title: 'Không thể thêm vào giỏ hàng',
        text: error || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
        confirmButtonColor: '#3b82f6'
      });
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
  // const getAvailableStock = () => {
  //   let currentStock = getCurrentStock();
    
  //   // Find matching item in cart
  //   if (cart && cart.items && Array.isArray(cart.items)) {
  //     const cartItem = cart.items.find(item => {
  //       // ✅ Check if item and productId exist
  //       if (!item || !item.productId || !currentProduct) return false;
  //       if (item.productId._id !== currentProduct._id) return false;
        
  //       // If has variants, must match variant too
  //       if (currentProduct?.hasVariants && selectedVariant) {
  //         return item.variantId === selectedVariant._id;
  //       }
        
  //       return true;
  //     });
      
  //     if (cartItem) {
  //       currentStock -= cartItem.quantity;
  //     }
  //   }
    
  //   return Math.max(0, currentStock);
  // };

  const getAvailableStock = () => {
  let currentStock = getCurrentStock();

  if (cart?.items?.length) {
    const cartItem = cart.items.find(item => {
      if (!item?.productId || !currentProduct) return false;
      if (item.productId._id !== currentProduct._id) return false;

      if (currentProduct?.hasVariants && selectedVariant) {
        return (item.variantId?._id || item.variantId) === selectedVariant._id;
      }

      return true;
    });

    if (cartItem) currentStock -= cartItem.quantity;
  }

  return Math.max(0, currentStock);
};


  const currentPrice = getCurrentPrice();
  const currentStock = getCurrentStock();
  const availableStock = getAvailableStock();
  // const availableStock = getCurrentStock();

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
    <div className="min-h-screen bg-gradient-to-b from-[#021717] via-[#042a2a] to-[#062f2f] text-white">
      {/* Breadcrumb */}
      <div className="border-b border-cyan-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-cyan-200">
            <button
              onClick={() => navigate('/shop')}
              className="hover:text-white/90 transition-colors duration-200"
            >
              Cửa hàng
            </button>
            <span>/</span>
            <span className="font-semibold text-white">{currentProduct.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image - glass centerpiece */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="aspect-square rounded-2xl overflow-hidden border border-cyan-300/30 bg-white/3 backdrop-blur-md shadow-lg"
            >
              <motion.img
                src={currentProduct.images?.[selectedImageIndex] || '/placeholder-product.jpg'}
                alt={currentProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
                animate={{ rotateY: [0, 6, -6, 0], scale: [1, 1.02, 0.99, 1] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
            </motion.div>

            {/* Thumbnail Images */}
            {currentProduct.images && currentProduct.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === index 
                        ? 'border-cyan-300 shadow-[0_4px_20px_rgba(0,255,209,0.08)]' 
                        : 'border-transparent hover:border-cyan-300/40'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${currentProduct.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
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
              <div className="flex items-center gap-3 mb-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center">
                  {renderStars(currentProduct.rating?.average || 0)}
                </motion.div>
                <span className="text-sm text-cyan-200/80">({currentProduct.rating?.count || 0} đánh giá)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-extrabold text-cyan-200">{formatPrice(currentPrice)}</div>
                {currentProduct.originalPrice && currentProduct.originalPrice > currentPrice && (
                  <>
                    <span className="text-lg text-cyan-200/60 line-through">{formatPrice(currentProduct.originalPrice)}</span>
                    <span className="ml-2 inline-block px-3 py-1 rounded-full bg-gradient-to-r from-red-400 to-pink-400 text-white text-sm font-semibold">-{discountPercentage}%</span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-3 h-3 rounded-full ${availableStock > 0 ? 'bg-emerald-400' : 'bg-red-500'}`}></div>
                <span className="text-sm text-cyan-200">{availableStock > 0 ? `Còn ${availableStock} sản phẩm` : 'Hết hàng'}</span>
                {currentStock > availableStock && (
                  <span className="text-xs text-cyan-100/70">({currentStock - availableStock} trong giỏ hàng)</span>
                )}
              </div>
            </div>

            {/* Variant Selector */}
            <div className="bg-white/3 backdrop-blur-md border border-cyan-300/20 p-4 rounded-lg">
              <ProductVariantSelector
                product={currentProduct}
                selectedVariant={selectedVariant}
                onVariantChange={handleVariantChange}
              />
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">Số lượng</label>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-md bg-white/5 border border-cyan-300/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MinusIcon className="w-4 h-4 text-cyan-100" />
                  </motion.button>
                  <span className="px-4 py-2 border border-cyan-300/20 rounded-md min-w-[60px] text-center text-white">{quantity}</span>
                  <motion.button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= currentStock}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-md bg-white/5 border border-cyan-300/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-4 h-4 text-cyan-100" />
                  </motion.button>
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
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={availableStock === 0 || (currentProduct?.hasVariants && !selectedVariant)}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-emerald-400 to-cyan-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-abyss-800 py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    {availableStock === 0 
                      ? 'Hết hàng' 
                      : currentProduct?.hasVariants && !selectedVariant
                      ? 'Chọn biến thể'
                      : 'Thêm vào giỏ hàng'}
                  </motion.button>
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
        <div className="glass-card mt-12 p-6 text-white">
          <h2 className="text-2xl font-bold mb-4 text-white">Mô Tả Sản Phẩm</h2>
          <div 
            className="product-description-content text-white leading-relaxed text-base"
            dangerouslySetInnerHTML={{ __html: currentProduct.description }}
          />
        </div>

        {/* Đánh giá sản phẩm */}
        <div id="review-section" className="glass-card mt-12 p-6 text-white">
          <h2 className="text-2xl font-bold mb-4 text-white">Đánh Giá Sản Phẩm</h2>

          {/* Form gửi đánh giá - Show if coming from order or if user purchased */}
          {user && (orderIdFromUrl || (reviews.purchased && !reviews.hasReviewed)) && (
            <div className="mb-6">
              {orderIdFromUrl && (
                <div className="mb-4 p-4 bg-amber-900/10 border border-amber-700/20 rounded-lg">
                  <p className="text-sm text-amber-200">
                    ⭐ Bạn đang viết đánh giá cho sản phẩm này từ đơn hàng đã hoàn thành. 
                    Hãy chia sẻ trải nghiệm của bạn!
                  </p>
                </div>
              )}
              <ReviewForm 
                productId={currentProduct._id} 
                orderId={orderIdFromUrl}
                onReviewSubmitted={() => {
                  // Refresh review status after submit
                  dispatch(checkReviewStatus(id));
                  dispatch(fetchReviews(id));
                }}
              />
            </div>
          )}

          {user && reviews.purchased && reviews.hasReviewed && !orderIdFromUrl && (
            <p className="text-cyan-100/80 mb-4">
              Bạn đã gửi đánh giá cho sản phẩm này rồi. Cảm ơn bạn!
            </p>
          )}

          {user && !reviews.purchased && !orderIdFromUrl && (
            <p className="text-cyan-100/80 mb-4">
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