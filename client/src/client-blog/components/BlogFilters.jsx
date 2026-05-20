import React from 'react';
import { Search } from 'lucide-react';

const BlogFilters = ({ categories, tags, filters, onChangeFilters, onClearFilters }) => {
  
  // Hàm xử lý việc chọn/bỏ chọn Tag
  const handleTagClick = (tagId) => {
    // Nếu tag đang nhấn đã được chọn rồi thì set về rỗng (bỏ chọn), ngược lại thì chọn tag đó
    const newTagValue = filters.tag === tagId ? '' : tagId;
    onChangeFilters({ ...filters, tag: newTagValue, page: 1 });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Search */}
      <div className="relative group">
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChangeFilters({ ...filters, search: e.target.value, page: 1 })}
          placeholder="Tìm kiếm bài viết..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 transition-all"
        />
        <Search className="absolute right-4 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
      </div>

      {/* 2. Category */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-3 block px-1">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onChangeFilters({ ...filters, category: e.target.value, page: 1 })}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
        >
          <option value="" className="bg-[#0a2828] text-white">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id} className="bg-[#0a2828] text-white">
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Tags - Logic Toggle nằm ở onClick */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-4 block px-1">Tags phổ biến</label>
        <div className="flex flex-wrap gap-2.5">
          {tags.map((tag) => {
            const isActive = filters.tag === tag._id;
            return (
              <button
                key={tag._id}
                // Thay đổi logic tại đây
                onClick={() => handleTagClick(tag._id)}
                className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-all duration-300 ${
                  isActive 
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/30'
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Clear All */}
      {(filters.search || filters.category || filters.tag) && (
        <button
          onClick={onClearFilters}
          className="mt-4 w-full py-3 text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/20 transition-all active:scale-95"
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );
};

export default BlogFilters;