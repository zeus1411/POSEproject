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
    <div className="group overflow-hidden rounded-2xl border border-water/45 bg-card text-card-foreground shadow-[0_14px_35px_rgb(var(--deep-ocean)/0.08)] transition-all duration-500 hover:scale-[1.02] hover:border-ocean/45 hover:shadow-[0_20px_45px_rgb(var(--deep-ocean)/0.14)] dark:glass-card">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-abyss/60"></div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-ocean text-primary-foreground text-xs px-2.5 py-1 rounded-full font-body font-bold shadow-sm dark:bg-neon-cyan dark:text-abyss dark:shadow-glow-cyan">
              Mới
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-nature backdrop-blur-sm text-accent-foreground text-xs px-2.5 py-1 rounded-full font-body font-medium dark:bg-emerald-500/80 dark:text-white">
              Nổi bật
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-full font-body font-bold shadow-sm dark:bg-coral dark:text-white dark:shadow-glow-coral">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Stock badge */}
        {totalStock === 0 && (
          <div className="absolute inset-0 bg-background/75 flex items-center justify-center dark:bg-abyss/60">
            <span className="rounded-full border border-border bg-card text-muted-foreground font-body font-semibold text-sm px-4 py-2 shadow-sm dark:glass-panel dark:text-gray-300">
              Hết hàng
            </span>
          </div>
        )}

        {/* Quick view on hover */}
        <div className="absolute inset-x-0 bottom-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleViewDetail}
            disabled={totalStock === 0}
            className="w-full py-3 px-4 bg-ocean/95 backdrop-blur-sm hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
                       text-primary-foreground text-sm font-body font-bold transition-colors duration-200 flex items-center justify-center gap-2
                       dark:bg-neon-cyan/90 dark:hover:bg-neon-cyan dark:disabled:bg-gray-700 dark:text-abyss"
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
          <span className="inline-block text-xs text-nature font-body font-semibold px-2 py-0.5 rounded-full bg-aqua/25 border border-water/45 dark:text-neon-cyan/70 dark:bg-neon-cyan/10 dark:border-neon-cyan/20">
            {product.categoryId.name}
          </span>
        )}

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="font-body font-semibold text-sm text-foreground line-clamp-2 hover:text-ocean transition-colors duration-200 leading-snug dark:text-gray-200 dark:hover:text-neon-cyan">
            {product.name}
          </h3>
        </Link>

        {/* Rating row */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <StarSolid
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.round(rating) ? 'text-yellow-500 dark:text-yellow-400' : 'text-border dark:text-gray-700'}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-body">{rating > 0 ? rating.toFixed(1) : '—'}</span>
          {ratingCount > 0 && (
            <span className="text-xs text-muted-foreground font-body">({ratingCount})</span>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-base font-headline font-bold text-ocean dark:text-neon-cyan">
            {renderPrice()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through font-body">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock status */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${totalStock > 0 ? 'bg-nature dark:bg-neon-cyan' : 'bg-destructive'}`}></div>
          <span className="text-xs text-muted-foreground font-body">
            {totalStock > 0 ? `Còn ${totalStock} sản phẩm` : 'Hết hàng'}
          </span>
          {product.soldCount > 0 && (
            <span className="text-xs text-muted-foreground font-body ml-auto">Đã bán {product.soldCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
