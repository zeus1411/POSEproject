import React from 'react';

const CategoryFilter = ({ categories = [], selectedCategory, onCategoryChange, isLoading }) => {
  const handleCategoryClick = (categoryId) => {
    // If clicking the same category, deselect it (show all)
    if (selectedCategory === categoryId) {
      onCategoryChange(null);
    } else {
      onCategoryChange(categoryId);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 h-20 w-32 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Danh mục sản phẩm</h2>
        {selectedCategory && (
          <button
            onClick={() => onCategoryChange(null)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Xem tất cả
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* All Products Button */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`
            flex-shrink-0 flex flex-col items-center justify-center
            px-6 py-4 rounded-xl border-2 transition-all duration-200
            min-w-[140px] h-24 transform hover:scale-105 active:scale-95
            ${
              !selectedCategory
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
            }
          `}
        >
          <div className={`text-2xl mb-1 ${!selectedCategory ? 'animate-bounce' : ''}`}>
            🏪
          </div>
          <span className="text-sm font-semibold">Tất cả</span>
        </button>

        {/* Category Buttons */}
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => handleCategoryClick(category._id)}
            className={`
              flex-shrink-0 flex flex-col items-center justify-center
              px-6 py-4 rounded-xl border-2 transition-all duration-200
              min-w-[140px] h-24 group relative overflow-hidden
              transform hover:scale-105 active:scale-95
              ${
                selectedCategory === category._id
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
              }
            `}
          >
            {/* Background decoration */}
            <div
              className={`
                absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                ${selectedCategory === category._id ? 'opacity-100' : ''}
              `}
            />

            {/* Icon */}
            <div
              className={`
                text-3xl mb-1.5 transition-transform duration-200 relative z-10
                ${selectedCategory === category._id ? 'animate-bounce' : 'group-hover:scale-110'}
              `}
            >
              {category.icon || '📦'}
            </div>

            {/* Category Name */}
            <span className="text-sm font-semibold text-center leading-tight relative z-10">
              {category.name}
            </span>

            {/* Product Count Badge */}
            {category.productCount > 0 && (
              <div
                className={`
                  absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold z-10
                  ${
                    selectedCategory === category._id
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                  }
                  transition-colors duration-200
                `}
              >
                {category.productCount}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Selected Category Info */}
      {selectedCategory && (
        <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Đang xem:</span>
            <span className="text-blue-600 font-semibold">
              {categories.find(cat => cat._id === selectedCategory)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
