import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StarIcon, HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';

const ProductCard = ({ product, onToggleWishlist, isInWishlist = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirect || '/shop'}`);
      return;
    }
    // Đã đăng nhập: gọi redux thunk addToCart
    await dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };
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
        <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="w-4 h-4 text-yellow-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  const discountPercentage = product.originalPrice && product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images?.[0]?.url || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Mới
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Nổi bật
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => onToggleWishlist?.(product._id)}
          className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors duration-200"
        >
          {isInWishlist ? (
            <HeartSolidIcon className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-600 hover:text-red-500" />
          )}
        </button>

        {/* Quick Add to Cart */}
        <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ShoppingCartIcon className="w-4 h-4" />
            Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.categoryId && (
          <p className="text-xs text-gray-500 mb-1">
            {product.categoryId.name}
          </p>
        )}

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {renderStars(product.rating?.average || 0)}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.rating?.count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-600">
              {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
            </span>
          </div>
          
          {product.soldCount > 0 && (
            <span className="text-xs text-gray-500">
              Đã bán {product.soldCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
