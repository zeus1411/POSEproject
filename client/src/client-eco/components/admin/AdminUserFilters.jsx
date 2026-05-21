import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminUserFilters = ({ filters, onFilterChange, onSearch, onReset }) => {
  const { isDark } = useTheme();
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearch('');
  };

  const handleFilterChange = (filterName, value) => {
    onFilterChange({ [filterName]: value, page: 1 });
  };

  const hasActiveFilters = filters.search || filters.role || filters.isActive !== '';

  return (
    <div className="glass-panel rounded-3xl shadow-xl p-6 mb-6 border border-water/30 dark:border-white/10">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên người dùng, email..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2.5 bg-aqua/5 border border-water/30 dark:bg-white/5 dark:border-white/10 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-water text-white rounded-xl hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all font-semibold text-sm"
          >
            Tìm kiếm
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Vai trò</label>
          <select
            value={filters.role || ''}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="w-full px-3 py-2.5 bg-aqua/5 border border-water/30 dark:bg-white/5 dark:border-white/10 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold transition-all cursor-pointer"
          >
            <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Tất cả vai trò</option>
            <option value="user" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Người dùng</option>
            <option value="admin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Quản trị viên</option>
          </select>
        </div>

        <div className="min-w-[150px]">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Sắp xếp</label>
          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2.5 bg-aqua/5 border border-water/30 dark:bg-white/5 dark:border-white/10 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold transition-all cursor-pointer"
          >
            <option value="createdAt" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Ngày tạo</option>
            <option value="username" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Tên người dùng</option>
            <option value="email" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Email</option>
          </select>
        </div>

        <div className="min-w-[120px]">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Thứ tự</label>
          <select
            value={filters.sortOrder || 'desc'}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="w-full px-3 py-2.5 bg-aqua/5 border border-water/30 dark:bg-white/5 dark:border-white/10 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold transition-all cursor-pointer"
          >
            {(filters.sortBy === 'username' || filters.sortBy === 'email') ? (
              <>
                <option value="asc" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">A → Z</option>
                <option value="desc" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Z → A</option>
              </>
            ) : (
              <>
                <option value="desc" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Mới nhất</option>
                <option value="asc" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Cũ nhất</option>
              </>
            )}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl transition-all font-semibold text-sm mt-auto border border-rose-200/50 dark:border-rose-900/20 active:scale-95"
          >
            <X size={16} />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-water/20 dark:bg-white/10 text-slate-800 dark:text-white border border-water/30 dark:border-white/20 rounded-full text-sm font-semibold">
              <span>Tìm: {filters.search}</span>
              <button
                onClick={() => onSearch('')}
                className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {filters.role && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-water/20 dark:bg-white/10 text-slate-800 dark:text-white border border-water/30 dark:border-white/20 rounded-full text-sm font-semibold">
              <span>Vai trò: {filters.role === 'user' ? 'Người dùng' : 'Quản trị viên'}</span>
              <button
                onClick={() => handleFilterChange('role', '')}
                className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUserFilters;
