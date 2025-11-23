import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StarIcon, ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';

const ProductCard = ({ product, onToggleWishlist, isInWishlist = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);

  const handleViewDetail = (e) => {
    e.stopPropagation();
    navigate(`/product/${product._id}`);
  };
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format giá hiển thị (Min-Max hoặc đơn)
  const renderPrice = () => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const activePrices = product.variants
        .filter(v => v.isActive)
        .map(v => v.price);
      
      if (activePrices.length > 0) {
        const minPrice = Math.min(...activePrices);
        const maxPrice = Math.max(...activePrices);
        
        if (minPrice === maxPrice) {
          return formatPrice(minPrice);
        }
        return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
      }
    }
    return formatPrice(product.price);
  };

  // Tính tổng stock từ variants hoặc product stock
  const getTotalStock = () => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      return product.variants
        .filter(v => v.isActive)
        .reduce((total, variant) => total + (variant.stock || 0), 0);
    }
    return product.stock || 0;
  };

  const totalStock = getTotalStock();

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

  const discountPercentage = product.originalPrice && product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-green-500 text-white text-sm px-3 py-1.5 rounded-full font-medium shadow-lg">
              Mới
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-blue-500 text-white text-sm px-3 py-1.5 rounded-full font-medium shadow-lg">
              Nổi bật
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-sm px-3 py-1.5 rounded-full font-medium shadow-lg">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Quick View Detail */}
        <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleViewDetail}
            disabled={totalStock === 0}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-base font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <EyeIcon className="w-5 h-5" />
            {totalStock === 0 ? 'Hết hàng' : 'Xem chi tiết sản phẩm'}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.categoryId && (
          <p className="text-sm text-gray-500 mb-2 font-medium">
            {product.categoryId.name}
          </p>
        )}

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors duration-200 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {renderStars(product.rating?.average || 0)}
          </div>
          <span className="text-sm text-gray-500 ml-1 font-medium">
            ({product.rating?.count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary-600">
            {renderPrice()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-base text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              totalStock > 0 ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600 font-medium">
              {totalStock > 0 ? `Còn ${totalStock} sản phẩm` : 'Hết hàng'}
            </span>
          </div>
          
          {product.soldCount > 0 && (
            <span className="text-sm text-gray-500 font-medium">
              Đã bán {product.soldCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
