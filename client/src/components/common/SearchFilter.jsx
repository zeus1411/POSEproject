import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchFilter = ({ 
  filters, 
  onFiltersChange, 
  categories = [], 
  isLoading = false 
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      sort: 'createdAt:desc'
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value && value !== 'createdAt:desc'
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </form>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
        >
          <FunnelIcon className="w-4 h-4" />
          Bộ lọc
        </button>

        {/* Sort Dropdown */}
        <select
          value={localFilters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="createdAt:desc">Mới nhất</option>
          <option value="createdAt:asc">Cũ nhất</option>
          <option value="price:asc">Giá thấp đến cao</option>
          <option value="price:desc">Giá cao đến thấp</option>
          <option value="soldCount:desc">Bán chạy nhất</option>
          <option value="rating.average:desc">Đánh giá cao nhất</option>
          <option value="name:asc">Tên A-Z</option>
          <option value="name:desc">Tên Z-A</option>
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            <XMarkIcon className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={localFilters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                disabled={isLoading}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khoảng giá
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Từ"
                  value={localFilters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={localFilters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng
              </label>
              <select
                value={localFilters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tất cả</option>
                <option value="true">Còn hàng</option>
                <option value="false">Hết hàng</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
