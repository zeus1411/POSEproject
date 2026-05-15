import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const SearchFilter = ({
  filters,
  onFiltersChange,
  categories = [],
  isLoading = false
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: localSearch });
  };

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
    // Live search with slight debounce feel — update immediately
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleSortChange = (e) => {
    onFiltersChange({ ...filters, sort: e.target.value });
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600
                       focus:outline-none focus:border-neon-cyan/40 focus:bg-white/8 transition-all duration-200 font-body"
          />
        </div>
      </form>

      {/* Sort Dropdown */}
      <div className="relative flex-shrink-0">
        <select
          value={filters.sort}
          onChange={handleSortChange}
          className="appearance-none pl-4 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300
                     focus:outline-none focus:border-neon-cyan/40 transition-all duration-200 font-body cursor-pointer
                     hover:bg-white/8 hover:text-white"
        >
          <option className="bg-[#051C1C] text-white" value="createdAt:desc">Mới nhất</option>
          <option className="bg-[#051C1C] text-white" value="createdAt:asc">Cũ nhất</option>
          <option className="bg-[#051C1C] text-white" value="price:asc">Giá thấp → cao</option>
          <option className="bg-[#051C1C] text-white" value="price:desc">Giá cao → thấp</option>
          <option className="bg-[#051C1C] text-white" value="soldCount:desc">Bán chạy nhất</option>
          <option className="bg-[#051C1C] text-white" value="rating.average:desc">Đánh giá cao nhất</option>
          <option className="bg-[#051C1C] text-white" value="name:asc">Tên A–Z</option>
          <option className="bg-[#051C1C] text-white" value="name:desc">Tên Z–A</option>
        </select>
        <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
          <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
