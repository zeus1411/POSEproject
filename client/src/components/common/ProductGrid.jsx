import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ 
  products = [], 
  isLoading = false, 
  onAddToCart, 
  onToggleWishlist,
  wishlistItems = [],
  className = ""
}) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-4 gap-3 md:gap-4 ${className}`}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-5 space-y-4">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              <div className="h-7 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
        <p className="text-gray-500">Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-4 gap-3 md:gap-4 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isInWishlist={wishlistItems.includes(product._id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
