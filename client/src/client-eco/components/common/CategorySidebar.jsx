import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon, StarIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import DualRangeSlider from './DualRangeSlider';

const SectionHeader = ({ title, isOpen, onToggle }) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center justify-between py-3 text-left group"
  >
    <span className="text-sm font-body font-semibold text-foreground uppercase tracking-widest dark:text-white">
      {title}
    </span>
    {isOpen
      ? <ChevronUpIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors dark:text-gray-400 dark:group-hover:text-neon-cyan" />
      : <ChevronDownIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors dark:text-gray-400 dark:group-hover:text-neon-cyan" />
    }
  </button>
);

const CategorySidebar = ({
  categories = [],
  selectedCategory,
  onCategoryChange,
  filters = {},
  onFiltersChange,
  isLoading
}) => {
  const priceLimits = { min: 0, max: 2000000 };
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    stock: true,
    rating: true,
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      onCategoryChange(null);
    } else {
      onCategoryChange(categoryId);
    }
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    (filters.minPrice !== '' && filters.minPrice !== null && filters.minPrice !== undefined) ||
    (filters.maxPrice !== '' && filters.maxPrice !== null && filters.maxPrice !== undefined) ||
    Boolean(filters.inStock) ||
    Boolean(filters.minRating);

  const clearAll = () => {
    onCategoryChange(null);
    onFiltersChange({
      search: filters.search || '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      minRating: '',
      sort: filters.sort || 'createdAt:desc',
    });
  };

  if (isLoading && (!categories || categories.length === 0)) {
    return (
      <div className="glass-panel rounded-2xl p-6 sticky top-6 space-y-4 animate-pulse">
        <div className="h-5 bg-muted rounded w-1/2 dark:bg-white/10"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-muted rounded-lg dark:bg-white/5"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl sticky top-6 overflow-hidden border-water/45 shadow-[0_18px_44px_rgb(var(--deep-ocean)/0.10)] dark:border-white/10 dark:shadow-glass">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-white/10">
        <span className="text-base font-headline font-bold text-foreground dark:text-white">Bộ lọc</span>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors font-body dark:text-neon-cyan dark:hover:text-white"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
            Xóa tất cả
          </button>
        )}
      </div>

      <div className="px-5 py-2 divide-y divide-border dark:divide-white/5">

        {/* ── Category ── */}
        <div>
          <SectionHeader title="Danh mục" isOpen={openSections.category} onToggle={() => toggleSection('category')} />
          {openSections.category && (
            <div className="pb-4 space-y-1.5">
              {/* All */}
              <button
                onClick={() => onCategoryChange(null)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-body transition-all duration-200
                  ${!selectedCategory
                    ? 'bg-aqua/35 text-ocean border border-water/45 dark:bg-neon-cyan/15 dark:text-neon-cyan dark:border-neon-cyan/30'
                    : 'text-muted-foreground hover:text-ocean hover:bg-aqua/20 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
                  }`}
              >
                <span className="text-base">🏪</span>
                <span className="flex-1 text-left">Tất cả sản phẩm</span>
                {!selectedCategory && <span className="w-1.5 h-1.5 rounded-full bg-nature dark:bg-neon-cyan"></span>}
              </button>

              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryClick(cat._id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-body transition-all duration-200
                    ${selectedCategory === cat._id
                      ? 'bg-aqua/35 text-ocean border border-water/45 dark:bg-neon-cyan/15 dark:text-neon-cyan dark:border-neon-cyan/30'
                      : 'text-muted-foreground hover:text-ocean hover:bg-aqua/20 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
                    }`}
                >
                  <span className="text-base">{cat.icon || '📦'}</span>
                  <span className="flex-1 text-left truncate">{cat.name}</span>
                  {cat.productCount > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      selectedCategory === cat._id ? 'bg-water/20 text-ocean dark:bg-neon-cyan/20 dark:text-neon-cyan' : 'bg-muted text-muted-foreground dark:bg-white/10 dark:text-gray-500'
                    }`}>
                      {cat.productCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Price Range ── */}
        <div>
          <SectionHeader title="Khoảng giá" isOpen={openSections.price} onToggle={() => toggleSection('price')} />
          {openSections.price && (
            <div className="pb-4">
              <DualRangeSlider
                min={priceLimits.min}
                max={priceLimits.max}
                minValue={filters.minPrice}
                maxValue={filters.maxPrice}
                onChange={({ minPrice, maxPrice }) => {
                  onFiltersChange({
                    ...filters,
                    minPrice,
                    maxPrice,
                  });
                }}
              />
            </div>
          )}
        </div>

        {/* ── Stock ── */}
        <div>
          <SectionHeader title="Tình trạng" isOpen={openSections.stock} onToggle={() => toggleSection('stock')} />
          {openSections.stock && (
            <div className="pb-4 space-y-2">
              {[
                { value: '', label: 'Tất cả' },
                { value: 'true', label: 'Còn hàng' },
                { value: 'false', label: 'Hết hàng' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 px-1 py-1 cursor-pointer group">
                  <div
                    onClick={() => handleFilterChange('inStock', opt.value)}
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer
                      ${filters.inStock === opt.value
                        ? 'bg-nature border-nature dark:bg-neon-cyan dark:border-neon-cyan'
                        : 'border-border group-hover:border-ocean/60 dark:border-gray-600 dark:group-hover:border-neon-cyan/50'
                      }`}
                  >
                    {filters.inStock === opt.value && (
                      <svg className="w-2.5 h-2.5 text-primary-foreground dark:text-abyss" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5L4 7.5 8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span
                    onClick={() => handleFilterChange('inStock', opt.value)}
                    className={`text-sm font-body cursor-pointer transition-colors ${
                      filters.inStock === opt.value ? 'text-nature dark:text-neon-cyan' : 'text-muted-foreground group-hover:text-ocean dark:text-gray-400 dark:group-hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ── Rating ── */}
        <div>
          <SectionHeader title="Đánh giá" isOpen={openSections.rating} onToggle={() => toggleSection('rating')} />
          {openSections.rating && (
            <div className="pb-4 space-y-2">
              {[
                { value: 5, label: '5 sao', hint: 'Đánh giá hoàn hảo' },
                { value: 4, label: '4 sao trở lên', hint: 'Lựa chọn nổi bật' },
                { value: 3, label: '3 sao trở lên', hint: 'Đáng cân nhắc' },
              ].map((option) => {
                const isActive = String(filters.minRating) === String(option.value);

                return (
                  <motion.button
                    key={option.value}
                    onClick={() => handleFilterChange('minRating', isActive ? '' : option.value)}
                    whileHover={{ x: 2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all duration-200
                      ${isActive
                        ? 'bg-aqua/30 border-water/50 shadow-sm dark:bg-cyan-300/10 dark:border-cyan-300/25 dark:shadow-[0_0_24px_rgba(34,211,238,0.08)]'
                        : 'border-border bg-card hover:bg-aqua/15 hover:border-water/60 dark:border-white/5 dark:bg-white/0 dark:hover:bg-white/5 dark:hover:border-white/10'
                      }`}
                    aria-pressed={isActive}
                  >
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[...Array(5)].map((_, i) => {
                        const filled = i < option.value;
                        return (
                          <motion.div
                            key={i}
                            initial={false}
                            animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                            transition={{ duration: 1.8, repeat: isActive ? Infinity : 0, delay: i * 0.04 }}
                          >
                            <StarIcon className={`w-4 h-4 transition-colors duration-200 ${filled ? (isActive ? 'text-ocean dark:text-cyan-300 dark:drop-shadow-[0_0_10px_rgba(103,232,249,0.65)]' : 'text-amber-500 dark:text-amber-300') : 'text-border dark:text-white/15'}`} />
                          </motion.div>
                        );
                      })}
                    </div>
                    <span className={`flex-1 text-sm font-medium ${isActive ? 'text-foreground dark:text-cyan-50' : 'text-muted-foreground dark:text-white/70'}`}>
                      {option.label}
                      <span className="block text-[11px] text-muted-foreground dark:text-white/40">{option.hint}</span>
                    </span>
                    {isActive && <span className="h-2 w-2 rounded-full bg-nature dark:bg-cyan-300 dark:shadow-[0_0_16px_rgba(103,232,249,0.9)]" />}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CategorySidebar;
