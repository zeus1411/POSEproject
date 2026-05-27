import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ 
  products = [], 
  isLoading = false, 
  onAddToCart, 
  className = ""
}) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 ${className}`}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-water/25 bg-card/70 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="aspect-square bg-muted dark:bg-white/[0.06]"></div>
            <div className="space-y-3 p-4">
              <div className="h-3 w-1/3 rounded bg-muted dark:bg-white/[0.07]"></div>
              <div className="h-4 w-4/5 rounded bg-muted dark:bg-white/[0.07]"></div>
              <div className="h-5 w-1/2 rounded bg-muted dark:bg-white/[0.07]"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-muted-foreground mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Không tìm thấy sản phẩm</h3>
        <p className="text-muted-foreground">Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
