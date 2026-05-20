import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StarIcon, ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';

const ProductCard = ({ product, onToggleWishlist, isInWishlist = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const renderPrice = () => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const activePrices = product.variants.filter(v => v.isActive).map(v => v.price);
      if (activePrices.length > 0) {
        const minPrice = Math.min(...activePrices);
        const maxPrice = Math.max(...activePrices);
        if (minPrice === maxPrice) return formatPrice(minPrice);
        return `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;
      }
    }
    return formatPrice(product.price);
  };

  const getTotalStock = () => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      return product.variants.filter(v => v.isActive).reduce((t, v) => t + (v.stock || 0), 0);
    }
    return product.stock || 0;
  };

  const totalStock = getTotalStock();
  const rating = product.rating?.average || 0;
  const ratingCount = product.rating?.count || 0;

  const discountPercentage = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <div className="group glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
          />
        </Link>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-abyss/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-neon-cyan text-abyss text-xs px-2.5 py-1 rounded-full font-body font-bold shadow-glow-cyan">
              Mới
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-emerald-500/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-body font-medium">
              Nổi bật
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-coral text-white text-xs px-2.5 py-1 rounded-full font-body font-bold shadow-glow-coral">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Stock badge */}
        {totalStock === 0 && (
          <div className="absolute inset-0 bg-abyss/60 flex items-center justify-center">
            <span className="glass-panel text-gray-300 font-body font-semibold text-sm px-4 py-2 rounded-full">
              Hết hàng
            </span>
          </div>
        )}

        {/* Quick view on hover */}
        <div className="absolute inset-x-0 bottom-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleViewDetail}
            disabled={totalStock === 0}
            className="w-full py-3 px-4 bg-neon-cyan/90 backdrop-blur-sm hover:bg-neon-cyan disabled:bg-gray-700 disabled:cursor-not-allowed
                       text-abyss text-sm font-body font-bold transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <EyeIcon className="w-4 h-4" />
            Xem chi tiết
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        {/* Category tag */}
        {product.categoryId && (
          <span className="inline-block text-xs text-neon-cyan/70 font-body px-2 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20">
            {product.categoryId.name}
          </span>
        )}

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="font-body font-semibold text-sm text-gray-200 line-clamp-2 hover:text-neon-cyan transition-colors duration-200 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating row */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <StarSolid
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-700'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-body">{rating > 0 ? rating.toFixed(1) : '—'}</span>
          {ratingCount > 0 && (
            <span className="text-xs text-gray-600 font-body">({ratingCount})</span>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-base font-headline font-bold text-neon-cyan">
            {renderPrice()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-gray-600 line-through font-body">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock status */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${totalStock > 0 ? 'bg-neon-cyan' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500 font-body">
            {totalStock > 0 ? `Còn ${totalStock} sản phẩm` : 'Hết hàng'}
          </span>
          {product.soldCount > 0 && (
            <span className="text-xs text-gray-600 font-body ml-auto">Đã bán {product.soldCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
