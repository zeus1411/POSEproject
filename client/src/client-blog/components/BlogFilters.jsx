import React from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '../../client-eco/context/ThemeContext';

const BlogFilters = ({ categories, tags, filters, onChangeFilters, onClearFilters }) => {
  const { isDark } = useTheme();

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
          className="w-full bg-aqua/5 dark:bg-white/5 border border-water/30 dark:border-white/10 rounded-2xl px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-nature dark:focus:ring-primary focus:bg-aqua/10 dark:focus:bg-white/10 transition-all font-semibold"
        />
        <Search className="absolute right-4 top-3.5 text-muted-foreground group-focus-within:text-nature dark:group-focus-within:text-emerald-400 transition-colors" size={20} />
      </div>

      {/* 2. Category */}
      <div>
        <label className="text-sm font-semibold text-muted-foreground mb-3 block px-1">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onChangeFilters({ ...filters, category: e.target.value, page: 1 })}
          className="w-full bg-aqua/5 dark:bg-white/5 border border-water/30 dark:border-white/10 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-nature dark:focus:ring-primary appearance-none cursor-pointer font-semibold"
          style={{ 
            backgroundImage: isDark
              ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")'
              : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%231F2937\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', 
            backgroundRepeat: 'no-repeat', 
            backgroundPosition: 'right 1rem center', 
            backgroundSize: '1.2em' 
          }}
        >
          <option value="" className="bg-white text-gray-800 dark:bg-[#0a2828] dark:text-white">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id} className="bg-white text-gray-800 dark:bg-[#0a2828] dark:text-white">
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Tags - Logic Toggle nằm ở onClick */}
      <div>
        <label className="text-sm font-semibold text-muted-foreground mb-4 block px-1">Tags phổ biến</label>
        <div className="flex flex-wrap gap-2.5">
          {tags.map((tag) => {
            const isActive = filters.tag === tag._id;
            return (
              <button
                key={tag._id}
                onClick={() => handleTagClick(tag._id)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-300 ${
                  isActive 
                    ? 'bg-nature dark:bg-emerald-500 border-nature dark:border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                    : 'bg-aqua/5 dark:bg-white/5 border-water/30 dark:border-white/10 text-muted-foreground hover:bg-aqua/10 dark:hover:bg-white/10 hover:border-water/40 dark:hover:border-white/30'
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
          className="mt-4 w-full py-3 text-sm font-bold text-nature dark:text-emerald-400 bg-nature/10 dark:bg-emerald-500/10 border border-nature/20 dark:border-emerald-500/20 rounded-2xl hover:bg-nature/20 dark:hover:bg-emerald-500/20 transition-all active:scale-95"
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );
};

export default BlogFilters;