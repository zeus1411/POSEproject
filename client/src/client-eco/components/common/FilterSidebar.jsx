import React, { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Squares2X2Icon,
  StarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import DualRangeSlider from './DualRangeSlider';

const browseGroups = [
  { key: 'aquarium', title: 'Loại bể', items: ['Nano tank', 'Nature aquarium', 'Low tech', 'CO2'] },
  { key: 'difficulty', title: 'Độ khó cây', items: ['Dễ chăm', 'Trung bình', 'Cây tiền cảnh'] },
  { key: 'fish', title: 'Loại cá', items: ['Cá đàn', 'Cá nano', 'Tép cảnh'] },
];

const Section = ({ title, open, onToggle, children }) => (
  <div className="border-b border-water/20 py-1 last:border-b-0 dark:border-white/[0.06]">
    <button type="button" onClick={onToggle} className="flex w-full items-center justify-between py-3 font-body text-sm font-semibold text-foreground">
      {title}
      {open ? <ChevronUpIcon className="h-4 w-4 text-muted-foreground" /> : <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />}
    </button>
    {open && <div className="pb-4">{children}</div>}
  </div>
);

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
    aquarium: false,
    difficulty: false,
    fish: false,
  });
  const toggle = (key) => setOpen((value) => ({ ...value, [key]: !value[key] }));
  const hasFilters = Boolean(selectedCategory || filters.search || filters.minPrice || filters.maxPrice || filters.inStock || filters.minRating);

  const update = (key, value) => onFiltersChange({ ...filters, [key]: value });
  const chooseBrowseTag = (tag) => update('search', filters.search === tag ? '' : tag);
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
          <div className="space-y-2">
            {[4, 3].map((rating) => {
              const active = String(filters.minRating) === String(rating);
              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => update('minRating', active ? '' : rating)}
                  className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 font-body text-sm transition ${
                    active ? 'border-primary/30 bg-primary/10 text-foreground' : 'border-transparent text-muted-foreground hover:bg-primary/10'
                  }`}
                >
                  <StarIcon className={`h-4 w-4 ${active ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
                  {rating} sao trở lên
                </button>
              );
            })}
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

        {browseGroups.map((group) => (
          <Section key={group.key} title={group.title} open={open[group.key]} onToggle={() => toggle(group.key)}>
            <div className="flex flex-wrap gap-2">
              {group.items.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => chooseBrowseTag(tag)}
                  className={`rounded-full border px-3 py-2 font-body text-xs transition ${
                    filters.search === tag
                      ? 'border-primary/40 bg-primary/10 text-ocean dark:text-neon-cyan'
                      : 'border-water/30 text-muted-foreground hover:border-primary/30 dark:border-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </Section>
        ))}
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
