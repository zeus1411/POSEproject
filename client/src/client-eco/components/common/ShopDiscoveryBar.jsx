import React, { useEffect, useState } from 'react';
import { AdjustmentsHorizontalIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const sortOptions = [
  { value: 'createdAt:desc', label: 'Mới nhất' },
  { value: 'soldCount:desc', label: 'Bán chạy nhất' },
  { value: 'rating.average:desc', label: 'Đánh giá cao' },
  { value: 'price:asc', label: 'Giá thấp đến cao' },
  { value: 'price:desc', label: 'Giá cao đến thấp' },
];

const quickFilters = [
  { label: 'Best seller', updates: { sort: 'soldCount:desc' } },
  { label: 'New arrivals', updates: { sort: 'createdAt:desc' } },
  { label: 'Trending', updates: { sort: 'rating.average:desc' } },
  { label: 'Low tech', query: 'low tech' },
  { label: 'CO2', query: 'CO2' },
  { label: 'Nano tank', query: 'nano' },
  { label: 'Fish', query: 'cá' },
  { label: 'Plants', query: 'cây thủy sinh' },
];

const ShopDiscoveryBar = ({ filters, onFiltersChange, onOpenFilters, isLoading, resultCount = 0 }) => {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  useEffect(() => {
    setSearchValue(filters.search || '');
  }, [filters.search]);

  const submitSearch = (event) => {
    event.preventDefault();
    onFiltersChange({ ...filters, search: searchValue.trim() });
  };

  const applyQuickFilter = (item) => {
    if (item.query) {
      const nextSearch = filters.search === item.query ? '' : item.query;
      setSearchValue(nextSearch);
      onFiltersChange({ ...filters, search: nextSearch });
      return;
    }
    onFiltersChange({ ...filters, ...item.updates });
  };

  return (
    <div className="sticky top-[72px] z-30 mb-7 rounded-2xl border border-water/30 bg-card/80 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#071f20]/80 sm:p-4">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenFilters}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-water/40 bg-aqua/15 text-ocean transition hover:bg-aqua/30 dark:border-white/10 dark:bg-white/5 dark:text-neon-cyan lg:hidden"
          aria-label="Mở bộ lọc"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
        </button>
        <form onSubmit={submitSearch} className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Tìm cá, cây, đèn hoặc setup..."
            className="h-11 w-full rounded-xl border border-water/40 bg-background/60 pl-11 pr-4 font-body text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15 dark:border-white/10 dark:bg-white/[0.04]"
          />
        </form>
        <div className="relative hidden shrink-0 sm:block">
          <select
            aria-label="Sắp xếp sản phẩm"
            value={filters.sort}
            onChange={(event) => onFiltersChange({ ...filters, sort: event.target.value })}
            className="shop-sort-select h-11 appearance-none rounded-xl border border-water/40 bg-background/60 pl-4 pr-10 font-body text-sm text-foreground outline-none transition focus:border-primary/60 dark:border-white/10 dark:bg-white/[0.04]"
          >
            {sortOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="mr-1 hidden shrink-0 font-body text-xs text-muted-foreground md:inline">
          {isLoading ? 'Đang tải...' : `${resultCount} sản phẩm`}
        </span>
        {quickFilters.map((item) => {
          const active = item.query ? filters.search === item.query : filters.sort === item.updates.sort;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => applyQuickFilter(item)}
              aria-pressed={active}
              className={`shrink-0 rounded-full border px-3.5 py-2 font-body text-xs font-medium transition ${
                active
                  ? 'border-primary/40 bg-primary/15 text-ocean dark:text-neon-cyan'
                  : 'border-water/30 bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground dark:border-white/10 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="relative mt-3 sm:hidden">
        <select
          aria-label="Sắp xếp sản phẩm"
          value={filters.sort}
          onChange={(event) => onFiltersChange({ ...filters, sort: event.target.value })}
          className="shop-sort-select h-10 w-full appearance-none rounded-xl border border-water/40 bg-background/60 pl-4 pr-10 font-body text-sm text-foreground outline-none dark:border-white/10 dark:bg-white/[0.04]"
        >
          {sortOptions.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
};

export default ShopDiscoveryBar;
