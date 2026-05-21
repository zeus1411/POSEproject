import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Mới nhất' },
  { value: 'createdAt:asc', label: 'Cũ nhất' },
  { value: 'price:asc', label: 'Giá tăng dần' },
  { value: 'price:desc', label: 'Giá giảm dần' },
  { value: 'name:asc', label: 'Tên A-Z' },
  { value: 'name:desc', label: 'Tên Z-A' },
];

const ProductFilters = ({ filters, categories, onFilterChange, onSearch, onReset }) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onSearch(searchTerm);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleSortChange = (sortValue) => {
    onFilterChange({ sort: sortValue });
    setIsSortOpen(false);
  };

  const getSortLabel = () => {
    const selected = SORT_OPTIONS.find(opt => opt.value === filters.sort);
    return selected ? selected.label : 'Sắp xếp';
  };

  return (
    <div className={`glass-panel rounded-3xl p-5 mb-6 border transition-all duration-300 ${
      isDark ? 'border-white/10 shadow-black/40' : 'border-water/30 shadow-slate-900/5'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className={isDark ? 'text-emerald-400' : 'text-primary'} />
          <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Bộ lọc sản phẩm</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                isDark 
                  ? 'border-white/10 text-gray-300 hover:bg-white/10' 
                  : 'border-water/20 text-slate-700 hover:bg-water/10'
              }`}
            >
              <span className="text-sm font-bold">{getSortLabel()}</span>
              <ChevronDown size={16} className={isDark ? 'text-gray-400' : 'text-slate-500'} />
            </button>
            
            {isSortOpen && (
              <div className={`absolute right-0 mt-1.5 w-48 rounded-xl shadow-xl z-20 border overflow-hidden transition-all duration-200 ${
                isDark ? 'bg-[#0B2525] border-white/10 text-white' : 'bg-white border-water/30 text-slate-800'
              }`}>
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`block w-full text-left px-4 py-2.5 text-sm transition-colors duration-200 ${
                      filters.sort === option.value 
                        ? (isDark ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-primary/10 text-primary font-bold') 
                        : (isDark ? 'text-gray-300 hover:bg-white/5' : 'text-slate-700 hover:bg-water/5')
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={onReset}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-xl border transition-all duration-200 ${
              isDark 
                ? 'border-white/10 text-gray-300 hover:bg-white/10 hover:text-white' 
                : 'border-water/20 text-slate-700 hover:bg-water/10 hover:text-slate-900'
            }`}
          >
            <X size={16} />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${
            isDark ? 'text-emerald-400' : 'text-primary'
          }`}>
            Tìm kiếm sản phẩm
          </label>
          <div className="relative">
            <Search size={18} className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 ${
              isDark ? 'text-gray-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              placeholder="Nhập tên hoặc mô tả sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' 
                  : 'bg-water/5 border-water/20 text-slate-800 focus:bg-water/10'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  onSearch('');
                }}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${
            isDark ? 'text-emerald-400' : 'text-primary'
          }`}>
            Danh mục
          </label>
          <select
            value={filters.categoryId}
            onChange={(e) => onFilterChange({ categoryId: e.target.value })}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white focus:bg-white/10 dark:text-white dark:bg-[#0B2525]' 
                : 'bg-water/5 border-water/20 text-slate-800 focus:bg-water/10 bg-white'
            }`}
          >
            <option value="" className={isDark ? 'bg-[#0B2525] text-white' : 'bg-white text-slate-800'}>Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id} className={isDark ? 'bg-[#0B2525] text-white' : 'bg-white text-slate-800'}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${
            isDark ? 'text-emerald-400' : 'text-primary'
          }`}>
            Trạng thái
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white focus:bg-white/10 dark:text-white dark:bg-[#0B2525]' 
                : 'bg-water/5 border-water/20 text-slate-800 focus:bg-water/10 bg-white'
            }`}
          >
            <option value="" className={isDark ? 'bg-[#0B2525] text-white' : 'bg-white text-slate-800'}>Tất cả trạng thái</option>
            <option value="ACTIVE" className={isDark ? 'bg-[#0B2525] text-emerald-400 font-bold' : 'bg-white text-green-700 font-bold'}>Đang hoạt động</option>
            <option value="INACTIVE" className={isDark ? 'bg-[#0B2525] text-rose-400 font-bold' : 'bg-white text-red-600 font-bold'}>Ngừng kinh doanh</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
