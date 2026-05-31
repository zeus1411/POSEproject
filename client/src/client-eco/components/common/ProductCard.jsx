import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { EyeIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

const RECENTLY_VIEWED_KEY = 'aquaticcaps-recently-viewed';
const SHOP_SCROLL_KEY = 'aquaticcaps-shop-scroll-position';

const ProductCard = ({
  product,
  variant = 'grid',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRail = variant === 'rail';
  const returnTo = `${location.pathname}${location.search}`;

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price || 0);

  const activeVariants = product.variants?.filter((item) => item.isActive) || [];
  const hasValidVariants = Boolean(product.hasVariants && activeVariants.length > 0);
  const variantPrices = activeVariants.map((item) => item.price);
  const minPrice = hasValidVariants ? Math.min(...variantPrices) : product.price;
  const maxPrice = hasValidVariants ? Math.max(...variantPrices) : product.price;
  const price = minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  const stock = hasValidVariants
    ? activeVariants.reduce((total, item) => total + (item.stock || 0), 0)
    : product.stock || 0;
  const rating = product.rating?.average || 0;
  const discount = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  const rememberViewed = () => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
      const snapshot = {
        _id: product._id,
        name: product.name,
        images: product.images,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        stock: product.stock,
        variants: product.variants,
        hasVariants: hasValidVariants,
        categoryId: product.categoryId,
        rating: product.rating,
        soldCount: product.soldCount,
      };
      const next = [snapshot, ...stored.filter((item) => item._id !== product._id)].slice(0, 10);
      window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('aquaticcaps:recent-viewed', { detail: next }));
    } catch (error) {
      // Browsing still works when storage is unavailable.
    }
  };

  const rememberShopPosition = () => {
    try {
      window.sessionStorage.setItem(SHOP_SCROLL_KEY, JSON.stringify({
        path: returnTo,
        scrollY: window.scrollY,
      }));
    } catch (error) {
      // Navigation still works when session storage is unavailable.
    }
  };

  const viewProduct = (event) => {
    event.preventDefault();
    rememberViewed();
    rememberShopPosition();
    navigate(`/product/${product._id}`, { state: { fromShop: returnTo } });
  };

  return (
    <article className={`group relative snap-start overflow-hidden rounded-2xl border border-water/30 bg-card/80 shadow-[0_12px_32px_rgb(var(--deep-ocean)/0.08)] transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_50px_rgb(var(--deep-ocean)/0.16)] dark:border-white/10 dark:bg-white/[0.045] dark:hover:shadow-[0_18px_42px_rgba(0,255,209,0.10)] ${isRail ? 'w-[215px] shrink-0 sm:w-[230px]' : 'w-full'}`}>
      <div className="relative aspect-[1/1.02] overflow-hidden bg-muted">
        <Link
          to={`/product/${product._id}`}
          state={{ fromShop: returnTo }}
          onClick={() => {
            rememberViewed();
            rememberShopPosition();
          }}
          aria-label={`Xem ${product.name}`}
        >
          <img
            src={product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.07]"
            onError={(event) => { event.currentTarget.src = '/placeholder-product.jpg'; }}
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss/70 via-transparent to-transparent opacity-50 transition group-hover:opacity-90" />

        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {product.isNew && <span className="rounded-full bg-neon-cyan px-2 py-1 font-body text-[10px] font-bold uppercase text-abyss">Mới</span>}
          {discount > 0 && <span className="rounded-full bg-coral px-2 py-1 font-body text-[10px] font-bold text-white">-{discount}%</span>}
        </div>
        <div className="absolute inset-x-2.5 bottom-2.5 flex gap-2 opacity-100 transition duration-300 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={viewProduct}
            className="media-overlay-action flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-abyss/70 px-3 font-body text-xs font-semibold text-white backdrop-blur-md transition hover:border-neon-cyan/50 hover:text-neon-cyan"
            aria-label="Xem chi tiết"
          >
            <EyeIcon className="h-5 w-5"  />
            <span>Xem chi tiết sản phẩm</span>
          </button>
        </div>
      </div>

      <div className={`${isRail ? 'p-3' : 'p-3.5 sm:p-4'}`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate font-body text-[10px] font-semibold uppercase tracking-[0.15em] text-ocean dark:text-neon-cyan/80">
            {product.categoryId?.name || 'Aquatic selection'}
          </span>
          <span className="flex shrink-0 items-center gap-1 font-body text-xs text-muted-foreground">
            <StarIcon className="h-3.5 w-3.5 text-amber-400" />
            {rating ? rating.toFixed(1) : 'New'}
          </span>
        </div>
        <Link
          to={`/product/${product._id}`}
          state={{ fromShop: returnTo }}
          onClick={() => {
            rememberViewed();
            rememberShopPosition();
          }}
        >
          <h3 className="line-clamp-2 min-h-[2.5rem] font-body text-sm font-semibold leading-5 text-foreground transition group-hover:text-ocean dark:group-hover:text-neon-cyan">
            {product.name}
          </h3>
        </Link>
        <div className="mt-3">
          <p className="font-body text-base font-bold text-ocean dark:text-neon-cyan">{price}</p>
          {product.originalPrice > product.price && (
            <p className="mt-0.5 font-body text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 font-body text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${stock > 0 ? 'bg-primary' : 'bg-destructive'}`} />
            {stock > 0 ? 'Còn hàng' : 'Hết hàng'}
          </span>
          {product.soldCount > 0 && <span>Đã bán {product.soldCount}</span>}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
