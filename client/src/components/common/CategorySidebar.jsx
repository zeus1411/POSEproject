import React from 'react';

const CategorySidebar = ({ categories = [], selectedCategory, onCategoryChange, isLoading }) => {
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-6"></div>
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 sticky top-6 w-[320px] flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📂</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Danh mục</h2>
        </div>
        <p className="text-sm text-gray-600">Chọn danh mục để lọc sản phẩm</p>
      </div>

      {/* Categories List */}
      <div className="p-4 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* All Products Button */}
        <button
          onClick={() => onCategoryChange(null)}
            className={`
            w-full flex items-center gap-4 px-5 py-4 rounded-xl
            transition-all duration-200 group
            ${!selectedCategory
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 scale-[1.02]'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
            }
          `}
        >
          <div className={`
            w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
            ${!selectedCategory 
              ? 'bg-white/20' 
              : 'bg-white group-hover:bg-blue-50'
            }
            transition-all duration-200
          `}>
            <span className={`text-3xl ${!selectedCategory ? 'animate-bounce' : 'group-hover:scale-110 transition-transform'}`}>
              🏪
            </span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-semibold text-lg leading-tight truncate">Tất cả sản phẩm</div>
            <div className={`text-sm ${!selectedCategory ? 'text-white/80' : 'text-gray-500'}`}>
              Xem toàn bộ
            </div>
          </div>
          {!selectedCategory && (
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          )}
        </button>

        {/* Divider */}
        <div className="py-2">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        {/* Category Buttons */}
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => handleCategoryClick(category._id)}
            className={`
              w-full flex items-center gap-4 px-4 py-3.5 rounded-xl
              transition-all duration-200 group relative overflow-hidden
              ${selectedCategory === category._id
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 scale-[1.02]'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
              }
            `}
          >
            {/* Icon Container */}
            <div className={`
              w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
              ${selectedCategory === category._id 
                ? 'bg-white/20' 
                : 'bg-white group-hover:bg-blue-50'
              }
              transition-all duration-200
            `}>
              <span className={`
                text-3xl
                ${selectedCategory === category._id 
                  ? 'animate-bounce' 
                  : 'group-hover:scale-110 transition-transform'
                }
              `}>
                {category.icon || '📦'}
              </span>
            </div>

            {/* Category Info */}
            <div className="flex-1 text-left min-w-0">
              <div className="font-semibold text-lg leading-tight line-clamp-2 overflow-wrap-anywhere">
                {category.name}
              </div>
              {category.description && (
                <div className={`
                  text-sm mt-0.5 line-clamp-1
                  ${selectedCategory === category._id ? 'text-white/80' : 'text-gray-500'}
                `}>
                  {category.description}
                </div>
              )}
            </div>

            {/* Product Count Badge */}
            {category.productCount !== undefined && category.productCount > 0 && (
              <div className={`
                px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0
                ${selectedCategory === category._id
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white'
                }
                transition-all duration-200
              `}>
                {category.productCount}
              </div>
            )}

            {/* Active Indicator */}
            {selectedCategory === category._id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Footer - Selected Info */}
      {selectedCategory && (
        <div className="p-4 border-t border-gray-200 bg-teal-50">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Đang lọc:</span>
            <span className="font-semibold text-teal-600">
              {categories.find(cat => cat._id === selectedCategory)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySidebar;
