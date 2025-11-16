import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

const AdminUserFilters = ({ filters, onFilterChange, onSearch, onReset }) => {
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
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên người dùng, email..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Tìm kiếm
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
          <select
            value={filters.role || ''}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Tất cả vai trò</option>
            <option value="user">Người dùng</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="createdAt">Ngày tạo</option>
            <option value="username">Tên người dùng</option>
            <option value="email">Email</option>
            <option value="lastLogin">Đăng nhập gần đây</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
          <select
            value={filters.sortOrder || 'desc'}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="desc">Mới nhất</option>
            <option value="asc">Cũ nhất</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium mt-auto"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <span>Tìm: {filters.search}</span>
              <button
                onClick={() => onSearch('')}
                className="hover:text-blue-600"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {filters.role && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <span>Vai trò: {filters.role === 'user' ? 'Người dùng' : 'Quản trị viên'}</span>
              <button
                onClick={() => handleFilterChange('role', '')}
                className="hover:text-blue-600"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUserFilters;
