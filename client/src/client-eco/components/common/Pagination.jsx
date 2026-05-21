import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = ""
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta);
         i <= Math.min(totalPages - 1, currentPage + delta);
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl border border-water/45 bg-card text-muted-foreground hover:text-ocean hover:border-ocean/45 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 dark:glass-panel dark:text-gray-400 dark:hover:text-neon-cyan dark:hover:border-neon-cyan/30"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-2 py-2 text-sm text-muted-foreground font-body">···</span>
          ) : (
            <button
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 text-sm font-body font-medium rounded-xl transition-all duration-200 ${
                page === currentPage
                  ? 'bg-ocean text-primary-foreground border border-ocean shadow-sm dark:bg-neon-cyan/15 dark:text-neon-cyan dark:border-neon-cyan/30 dark:shadow-glow-cyan'
                  : 'border border-water/45 bg-card text-muted-foreground hover:text-ocean hover:border-ocean/45 dark:glass-panel dark:text-gray-400 dark:hover:text-white dark:hover:border-white/20'
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-water/45 bg-card text-muted-foreground hover:text-ocean hover:border-ocean/45 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 dark:glass-panel dark:text-gray-400 dark:hover:text-neon-cyan dark:hover:border-neon-cyan/30"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
