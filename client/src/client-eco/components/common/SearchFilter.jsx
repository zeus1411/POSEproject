import React, { useEffect, useState } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const sortOptions = [
  { value: 'createdAt:desc', label: 'Mới nhất' },
  { value: 'createdAt:asc', label: 'Cũ nhất' },
  { value: 'price:asc', label: 'Giá thấp đến cao' },
  { value: 'price:desc', label: 'Giá cao đến thấp' },
  { value: 'soldCount:desc', label: 'Bán chạy nhất' },
  { value: 'rating.average:desc', label: 'Đánh giá cao nhất' },
  { value: 'name:asc', label: 'Tên A-Z' },
  { value: 'name:desc', label: 'Tên Z-A' },
];

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
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleSortChange = (e) => {
    onFiltersChange({ ...filters, sort: e.target.value });
  };

  return (
    <div className="mb-4 flex items-center gap-3">
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <MagnifyingGlassIcon className="h-4 w-4 text-ocean dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-water/55 bg-card py-2.5 pl-9 pr-4 font-body text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all duration-200 focus:border-ocean focus:bg-card focus:outline-none focus:ring-2 focus:ring-aqua/35 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-600 dark:focus:border-neon-cyan/40 dark:focus:bg-white/8 dark:focus:ring-0"
          />
        </div>
      </form>

      <div className="relative flex-shrink-0">
        <select
          value={filters.sort}
          onChange={handleSortChange}
          className="cursor-pointer appearance-none rounded-xl border border-water/55 bg-card py-2.5 pl-4 pr-8 font-body text-sm text-foreground shadow-sm transition-all duration-200 hover:bg-aqua/20 hover:text-foreground focus:border-ocean focus:outline-none focus:ring-2 focus:ring-aqua/35 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/8 dark:hover:text-white dark:focus:border-neon-cyan/40 dark:focus:ring-0"
        >
          {sortOptions.map((option) => (
            <option
              key={option.value}
              className="bg-card text-foreground dark:bg-[#051C1C] dark:text-white"
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
          <ChevronDownIcon className="h-3.5 w-3.5 text-ocean dark:text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
