import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';

const RecommendationSection = ({
  id,
  eyebrow,
  title,
  description,
  products = [],
  isLoading = false,
  onAddToCart,
}) => {
  const carouselRef = useRef(null);
  const [scrollState, setScrollState] = useState({ canLeft: false, canRight: false });

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return undefined;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = carousel;
      setScrollState({
        canLeft: scrollLeft > 4,
        canRight: scrollLeft + clientWidth < scrollWidth - 4,
      });
    };

    updateScrollState();
    carousel.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      carousel.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [products.length, isLoading]);

  const scrollProducts = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * Math.max(carousel.clientWidth * 0.82, 240),
      behavior: 'smooth',
    });
  };

  if (!isLoading && products.length === 0) return null;

  return (
    <section id={id} className="mb-10 scroll-mt-28">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-ocean dark:text-neon-cyan">{eyebrow}</p>
          <h2 className="font-headline text-2xl font-semibold text-foreground sm:text-[1.7rem]">{title}</h2>
          {description && <p className="mt-2 max-w-xl font-body text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollProducts(-1)}
            disabled={!scrollState.canLeft}
            aria-label={`Cuộn ${title} sang trái`}
            className="grid h-10 w-10 place-items-center rounded-full border border-water/35 bg-card/60 text-foreground transition hover:border-primary/40 hover:text-ocean disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/10 dark:hover:text-neon-cyan"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollProducts(1)}
            disabled={!scrollState.canRight}
            aria-label={`Cuộn ${title} sang phải`}
            className="grid h-10 w-10 place-items-center rounded-full border border-water/35 bg-card/60 text-foreground transition hover:border-primary/40 hover:text-ocean disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/10 dark:hover:text-neon-cyan"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div ref={carouselRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading
          ? [...Array(4)].map((_, index) => (
            <div key={index} className="h-72 w-[220px] shrink-0 animate-pulse rounded-2xl border border-water/25 bg-card/60 dark:border-white/10" />
          ))
          : products.map((product) => (
            <ProductCard
              key={`${id}-${product._id}`}
              product={product}
              variant="rail"
              onAddToCart={onAddToCart}
            />
          ))}
      </div>
      <div className="mt-5 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  );
};

export default RecommendationSection;
