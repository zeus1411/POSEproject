import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../client-eco/context/ThemeContext';

const SimplePagination = ({ current, total, onPageChange }) => {
  const { isDark } = useTheme();

  // Hàm logic để hiển thị số trang (ví dụ: 1, 2, ..., 10) nếu quá nhiều trang
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (current < total - 2) pages.push('...');
      if (!pages.includes(total)) pages.push(total);
    }
    return pages;
  };

  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-12 pb-10">
      {/* Nút Previous */}
      <button
        onClick={() => current > 1 && onPageChange(current - 1)}
        disabled={current === 1}
        className={`p-2.5 rounded-xl border transition-all ${
          current === 1 
            ? 'border-water/10 dark:border-white/5 text-muted-foreground/40 cursor-not-allowed' 
            : 'border-water/30 dark:border-white/10 text-foreground hover:bg-aqua/10 dark:hover:bg-white/10 hover:border-nature dark:hover:border-emerald-500/50'
        }`}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Danh sách số trang */}
      <div className="flex items-center gap-2 bg-aqua/5 dark:bg-white/5 backdrop-blur-md border border-water/30 dark:border-white/10 p-1.5 rounded-2xl">
        {getPageNumbers().map((p, index) => (
          <React.Fragment key={index}>
            {p === '...' ? (
              <span className="px-2 text-muted-foreground font-semibold">...</span>
            ) : (
              <button
                onClick={() => onPageChange(p)}
                className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${
                  Number(p) === Number(current)
                    ? 'bg-nature dark:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110 z-10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-aqua/10 dark:hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Nút Next */}
      <button
        onClick={() => current < total && onPageChange(current + 1)}
        disabled={current === total}
        className={`p-2.5 rounded-xl border transition-all ${
          current === total 
            ? 'border-water/10 dark:border-white/5 text-muted-foreground/40 cursor-not-allowed' 
            : 'border-water/30 dark:border-white/10 text-foreground hover:bg-aqua/10 dark:hover:bg-white/10 hover:border-nature dark:hover:border-emerald-500/50'
        }`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default SimplePagination;