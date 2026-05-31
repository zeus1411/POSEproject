import React, { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Squares2X2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import DualRangeSlider from './DualRangeSlider';

const Section = ({ title, open, onToggle, children }) => (
  <div className="border-b border-water/20 py-1 last:border-b-0 dark:border-white/[0.06]">
    <button type="button" onClick={onToggle} className="flex w-full items-center justify-between py-3 font-body text-sm font-semibold text-foreground">
      {title}
      {open ? <ChevronUpIcon className="h-4 w-4 text-muted-foreground" /> : <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />}
    </button>
    {open && <div className="pb-4">{children}</div>}
  </div>
);

const RatingStar = ({ index, value, onPreview, onSelect }) => {
  const fill = Math.max(0, Math.min(1, value - index));

  const getRatingFromPointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isHalf = event.clientX - rect.left <= rect.width / 2;
    return index + (isHalf ? 0.5 : 1);
  };

  return (
    <button
      type="button"
      onMouseMove={(event) => onPreview(getRatingFromPointer(event))}
      onFocus={() => onPreview(index + 1)}
      onClick={(event) => onSelect(getRatingFromPointer(event))}
      className="relative h-8 w-8 rounded-md text-slate-300 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-white/25"
      aria-label={`Chọn ${index + 0.5} hoặc ${index + 1} sao`}
    >
      <StarIcon className="h-8 w-8" />
      <span className="pointer-events-none absolute inset-0 overflow-hidden text-amber-400" style={{ width: `${fill * 100}%` }}>
        <StarIcon className="h-8 w-8" />
      </span>
    </button>
  );
};

const FilterSidebar = ({
  categories = [],
  selectedCategory,
  onCategoryChange,
  filters = {},
  onFiltersChange,
  onDone,
}) => {
  const [open, setOpen] = useState({
    category: true,
    price: true,
    rating: true,
    stock: true,
  });
  const [hoverRating, setHoverRating] = useState(null);
  const toggle = (key) => setOpen((value) => ({ ...value, [key]: !value[key] }));
  const selectedRating = Number(filters.maxRating || 0);
  const previewRating = hoverRating ?? selectedRating;
  const hasFilters = Boolean(
    selectedCategory
    || filters.search
    || filters.minPrice
    || filters.maxPrice
    || filters.inStock
    || filters.minRating
    || filters.maxRating
  );

  const update = (key, value) => onFiltersChange({ ...filters, [key]: value });
  const updateRating = (rating) => {
    update('maxRating', selectedRating === rating ? '' : rating);
  };
  const clearAll = () => {
    onCategoryChange(null);
    onFiltersChange({
      ...filters,
      categoryId: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      minRating: '',
      maxRating: '',
    });
  };

  return (
    <aside className="glass-panel overflow-hidden rounded-2xl border-water/30 dark:border-white/10">
      <header className="flex items-center justify-between border-b border-water/25 px-5 py-4 dark:border-white/[0.07]">
        <div>
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Tinh chỉnh</p>
          <h2 className="mt-1 font-headline text-xl font-semibold text-foreground">Bộ lọc</h2>
        </div>
        {hasFilters && (
          <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 font-body text-xs text-ocean transition hover:text-primary dark:text-neon-cyan">
            <XMarkIcon className="h-4 w-4" /> Xóa
          </button>
        )}
      </header>

      <div className="px-5 py-2">
        <Section title="Danh mục" open={open.category} onToggle={() => toggle('category')}>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onCategoryChange(null)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 font-body text-sm transition ${
                !selectedCategory ? 'bg-primary/10 text-ocean dark:text-neon-cyan' : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
              <span className="flex-1 text-left">Tất cả sản phẩm</span>
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category._id}
                onClick={() => onCategoryChange(selectedCategory === category._id ? null : category._id)}
                className={`flex w-full items-center rounded-xl px-3 py-2.5 font-body text-sm transition ${
                  selectedCategory === category._id ? 'bg-primary/10 text-ocean dark:text-neon-cyan' : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
                }`}
              >
                <span className="flex-1 truncate text-left">{category.name}</span>
                {category.productCount > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{category.productCount}</span>
                )}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Khoảng giá" open={open.price} onToggle={() => toggle('price')}>
          <DualRangeSlider
            min={0}
            max={2000000}
            minValue={filters.minPrice}
            maxValue={filters.maxPrice}
            onChange={({ minPrice, maxPrice }) => onFiltersChange({ ...filters, minPrice, maxPrice })}
          />
        </Section>

        <Section title="Đánh giá" open={open.rating} onToggle={() => toggle('rating')}>
          <div className="space-y-3">
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHoverRating(null)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setHoverRating(null);
                }
              }}
            >
              {[0, 1, 2, 3, 4].map((index) => (
                <RatingStar
                  key={index}
                  index={index}
                  value={previewRating}
                  onPreview={setHoverRating}
                  onSelect={updateRating}
                />
              ))}
            </div>
            <p className="font-body text-xs text-muted-foreground">
              {hoverRating
                ? `Nhấn để lọc ${hoverRating.toFixed(1)} sao trở xuống`
                : selectedRating
                ? `Đang hiển thị sản phẩm ${selectedRating.toFixed(1)} sao trở xuống`
                : 'Di chuột để xem trước, nhấn để lọc theo nửa sao.'}
            </p>
          </div>
        </Section>

        <Section title="Tình trạng" open={open.stock} onToggle={() => toggle('stock')}>
          <div className="flex gap-2">
            {[
              { value: 'true', label: 'Còn hàng' },
              { value: 'false', label: 'Hết hàng' },
            ].map((choice) => (
              <button
                type="button"
                key={choice.value}
                onClick={() => update('inStock', filters.inStock === choice.value ? '' : choice.value)}
                className={`rounded-full border px-3 py-2 font-body text-xs transition ${
                  filters.inStock === choice.value
                    ? 'border-primary/40 bg-primary/10 text-ocean dark:text-neon-cyan'
                    : 'border-water/30 text-muted-foreground dark:border-white/10'
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </Section>
      </div>

      {onDone && (
        <div className="border-t border-water/25 p-4 dark:border-white/10">
          <button type="button" onClick={onDone} className="w-full rounded-xl bg-primary py-3 font-body text-sm font-semibold text-primary-foreground">
            Xem sản phẩm
          </button>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
