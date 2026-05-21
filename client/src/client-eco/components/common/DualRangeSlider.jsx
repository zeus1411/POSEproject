import React, { useEffect, useMemo, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const parsePrice = (value, fallback) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
}).format(value || 0);

const STEP = 100000;

const DualRangeSlider = ({
  min = 0,
  max = 5000000,
  minValue = '',
  maxValue = '',
  onChange,
  debounceMs = 280,
}) => {
  const [draft, setDraft] = useState(() => ({
    min: parsePrice(minValue, min),
    max: parsePrice(maxValue, max),
  }));
  const skipEmitRef = useRef(true);
  const onChangeRef = useRef(onChange);
  const trackRef = useRef(null);
  const activeThumbRef = useRef(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    skipEmitRef.current = true;
    setDraft({
      min: parsePrice(minValue, min),
      max: parsePrice(maxValue, max),
    });
  }, [min, max, minValue, maxValue]);

  useEffect(() => {
    if (skipEmitRef.current) {
      skipEmitRef.current = false;
      return undefined;
    }

    const timer = window.setTimeout(() => {
      if (typeof onChangeRef.current === 'function') {
        onChangeRef.current({
          minPrice: draft.min === min ? '' : draft.min,
          maxPrice: draft.max === max ? '' : draft.max,
        });
      }
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [debounceMs, draft.max, draft.min, max, min]);

  const minPercent = useMemo(() => ((draft.min - min) / (max - min || 1)) * 100, [draft.min, max, min]);
  const maxPercent = useMemo(() => ((draft.max - min) / (max - min || 1)) * 100, [draft.max, max, min]);

  const getValueFromClientX = (clientX) => {
    const track = trackRef.current;
    if (!track) return min;

    const rect = track.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / (rect.width || 1), 0, 1);
    const rawValue = min + ratio * (max - min);
    return clamp(Math.round(rawValue / STEP) * STEP, min, max);
  };

  const updateDraftFromClientX = (clientX, thumb) => {
    const nextValue = getValueFromClientX(clientX);

    skipEmitRef.current = false;
    setDraft((current) => {
      if (thumb === 'min') {
        return { ...current, min: clamp(nextValue, min, current.max) };
      }

      return { ...current, max: clamp(nextValue, current.min, max) };
    });
  };

  const handlePointerDown = (event, thumb) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    activeThumbRef.current = thumb;
    updateDraftFromClientX(event.clientX, thumb);
  };

  const handleTrackPointerDown = (event) => {
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const nextValue = getValueFromClientX(event.clientX);
    const distanceToMin = Math.abs(nextValue - draft.min);
    const distanceToMax = Math.abs(nextValue - draft.max);
    const thumb = distanceToMin <= distanceToMax ? 'min' : 'max';

    handlePointerDown(event, thumb);
  };

  const handlePointerMove = (event) => {
    if (!activeThumbRef.current) return;
    updateDraftFromClientX(event.clientX, activeThumbRef.current);
  };

  const handlePointerUp = () => {
    activeThumbRef.current = null;
  };

  const handleKeyDown = (event, thumb) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    skipEmitRef.current = false;

    setDraft((current) => {
      if (thumb === 'min') {
        if (event.key === 'Home') return { ...current, min: min };
        if (event.key === 'End') return { ...current, min: current.max };

        const direction = event.key === 'ArrowRight' ? 1 : -1;
        return { ...current, min: clamp(current.min + direction * STEP, min, current.max) };
      }

      if (event.key === 'Home') return { ...current, max: current.min };
      if (event.key === 'End') return { ...current, max: max };

      const direction = event.key === 'ArrowRight' ? 1 : -1;
      return { ...current, max: clamp(current.max + direction * STEP, current.min, max) };
    });
  };

  return (
    <div className="rounded-2xl border border-water/50 bg-card px-4 py-4 shadow-[0_14px_35px_rgb(var(--deep-ocean)/0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-nature dark:text-emerald-100/50">Khoảng giá</p>
          <p className="mt-1 text-foreground dark:text-white/80">Kéo hai đầu để lọc theo ngân sách</p>
        </div>
        <div className="rounded-full border border-water/50 bg-aqua/25 px-3 py-1.5 text-right text-xs font-semibold text-ocean dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">
          <div>{formatCurrency(draft.min)}</div>
          <div className="text-muted-foreground dark:text-white/45">- {formatCurrency(draft.max)}</div>
        </div>
      </div>

      <div className="mt-6 px-1">
        <div
          ref={trackRef}
          className="relative h-10 select-none"
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-muted dark:bg-white/10" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-nature via-ocean to-water shadow-sm dark:from-emerald-300 dark:via-cyan-300 dark:to-teal-300 dark:shadow-[0_0_24px_rgba(45,212,191,0.35)]"
            style={{ left: `${minPercent}%`, width: `${Math.max(maxPercent - minPercent, 0)}%` }}
          />

          <button
            type="button"
            onPointerDown={(event) => handlePointerDown(event, 'min')}
            onKeyDown={(event) => handleKeyDown(event, 'min')}
            aria-label="Giá tối thiểu"
            aria-valuemin={min}
            aria-valuemax={draft.max}
            aria-valuenow={draft.min}
            className="absolute top-1/2 z-40 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ocean bg-card shadow-sm transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-aqua/60 dark:border-cyan-100/50 dark:bg-[#072525] dark:shadow-[0_0_0_6px_rgba(45,212,191,0.12),0_0_25px_rgba(34,211,238,0.45)] dark:focus:ring-cyan-200/40"
            style={{ left: `${minPercent}%` }}
          />
          <button
            type="button"
            onPointerDown={(event) => handlePointerDown(event, 'max')}
            onKeyDown={(event) => handleKeyDown(event, 'max')}
            aria-label="Giá tối đa"
            aria-valuemin={draft.min}
            aria-valuemax={max}
            aria-valuenow={draft.max}
            className="absolute top-1/2 z-40 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ocean bg-card shadow-sm transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-aqua/60 dark:border-cyan-100/50 dark:bg-[#072525] dark:shadow-[0_0_0_6px_rgba(45,212,191,0.12),0_0_25px_rgba(34,211,238,0.45)] dark:focus:ring-cyan-200/40"
            style={{ left: `${maxPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground dark:text-white/40">
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(max)}</span>
      </div>
    </div>
  );
};

export default DualRangeSlider;
