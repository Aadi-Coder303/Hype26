'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';

const BRANDS = ['Jordan', 'Adidas', 'Nike', 'On Running', 'New Balance', 'Puma', 'ANTA'];
const CATEGORIES = ['Men', 'Women', 'Kids'];

const PRICE_STEP = 500;
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100000;

function formatINR(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

interface FilterFacets {
  sizes: string[];
  priceRange: { min: number; max: number };
  subCategories: { label: string; count: number }[];
}

// Collapsible filter section component
function FilterSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full group"
      >
        <h3 className="font-bold uppercase tracking-wider text-sm">{title}</h3>
        <ChevronDown
          size={14}
          className={twMerge(
            "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-all duration-300",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>
      <div
        className={twMerge(
          "overflow-hidden transition-all duration-300 ease-out",
          isOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Checkbox item component
function CheckboxItem({ label, isActive, onChange, count }: { label: string; isActive: boolean; onChange: () => void; count?: number }) {
  return (
    <label className="group flex items-center gap-3 cursor-pointer">
      <div className={`w-4 h-4 rounded-sm border transition-all duration-200 flex items-center justify-center shrink-0 ${isActive ? 'bg-[#E63946] border-[#E63946]' : 'border-neutral-300 dark:border-neutral-600 group-hover:border-[#E63946]'}`}>
        {isActive && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </div>
      <input
        type="checkbox"
        checked={isActive}
        onChange={onChange}
        className="hidden"
      />
      <span className={`text-sm transition-colors duration-200 flex-1 ${isActive ? 'text-black dark:text-white font-bold' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white'}`}>
        {label}
      </span>
      {count !== undefined && (
        <span className="text-[10px] text-neutral-400 tabular-nums">{count}</span>
      )}
    </label>
  );
}

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [facets, setFacets] = useState<FilterFacets | null>(null);
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const priceDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Parse current params into arrays
  const currentBrands = searchParams.get('brand')?.split(',').filter(Boolean) || [];
  const currentCategories = searchParams.get('category')?.split(',').filter(Boolean) || [];
  const currentSizes = searchParams.get('size')?.split(',').filter(Boolean) || [];
  const currentSubCategories = searchParams.get('subcategory')?.split(',').filter(Boolean) || [];
  const currentPriceRange = searchParams.get('price') || '';
  const currentInStock = searchParams.get('instock') === '1';

  // Price slider state (local for instant feedback, debounced to URL)
  const globalMin = facets?.priceRange?.min ?? DEFAULT_MIN;
  const globalMax = facets?.priceRange?.max ?? DEFAULT_MAX;
  // Round to nearest step
  const sliderMin = Math.floor(globalMin / PRICE_STEP) * PRICE_STEP;
  const sliderMax = Math.ceil(globalMax / PRICE_STEP) * PRICE_STEP;

  const parsedPrice = currentPriceRange.split('-').map(Number);
  const urlMin = !isNaN(parsedPrice[0]) ? parsedPrice[0] : sliderMin;
  const urlMax = !isNaN(parsedPrice[1]) ? parsedPrice[1] : sliderMax;

  const [priceMin, setPriceMin] = useState(urlMin);
  const [priceMax, setPriceMax] = useState(urlMax);

  // Sync local slider when URL changes externally (e.g. clear filters)
  useEffect(() => {
    setPriceMin(urlMin);
    setPriceMax(urlMax);
  }, [urlMin, urlMax]);

  // Fetch dynamic facets
  useEffect(() => {
    fetch('/api/products/filters')
      .then(res => res.json())
      .then(data => setFacets(data))
      .catch(console.error);
  }, []);

  const toggleFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.get(key)?.split(',').filter(Boolean) || [];

    let newValues;
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }

    if (newValues.length > 0) {
      params.set(key, newValues.join(','));
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  const setFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key);
    if (current === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  // Debounced price push
  const pushPrice = useCallback((min: number, max: number) => {
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (min <= sliderMin && max >= sliderMax) {
        params.delete('price');
      } else {
        params.set('price', `${min}-${max}`);
      }
      router.push(`?${params.toString()}`);
    }, 400);
  }, [searchParams, router, sliderMin, sliderMax]);

  const handlePriceMin = (val: number) => {
    const clamped = Math.min(val, priceMax - PRICE_STEP);
    setPriceMin(clamped);
    pushPrice(clamped, priceMax);
  };

  const handlePriceMax = (val: number) => {
    const clamped = Math.max(val, priceMin + PRICE_STEP);
    setPriceMax(clamped);
    pushPrice(priceMin, clamped);
  };

  const resetPrice = () => {
    setPriceMin(sliderMin);
    setPriceMax(sliderMax);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('price');
    router.push(`?${params.toString()}`);
  };

  const priceIsFiltered = priceMin > sliderMin || priceMax < sliderMax;

  const toggleInStock = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('instock') === '1') {
      params.delete('instock');
    } else {
      params.set('instock', '1');
    }
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  const hasActiveFilters = currentBrands.length > 0 || currentCategories.length > 0 || currentSizes.length > 0 || currentSubCategories.length > 0 || currentPriceRange || currentInStock;

  const activeFilterCount = currentBrands.length + currentCategories.length + currentSizes.length + currentSubCategories.length + (currentPriceRange ? 1 : 0) + (currentInStock ? 1 : 0);

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('brand');
    params.delete('category');
    params.delete('size');
    params.delete('subcategory');
    params.delete('price');
    params.delete('instock');
    router.push(`?${params.toString()}`);
    setMobileOpen(false);
  };

  // Sizes to display (collapsed vs expanded)
  const displaySizes = facets?.sizes || [];
  const visibleSizes = showAllSizes ? displaySizes : displaySizes.slice(0, 12);

  const filterContent = (
    <div className="space-y-6">
      {/* In-Stock Toggle */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <label className="group flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="font-bold uppercase tracking-wider text-sm">In Stock Only</span>
          </div>
          <button
            onClick={toggleInStock}
            className={twMerge(
              "relative w-11 h-6 rounded-full transition-colors duration-300",
              currentInStock
                ? "bg-[#E63946]"
                : "bg-neutral-300 dark:bg-neutral-700"
            )}
          >
            <span
              className={twMerge(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300",
                currentInStock ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </label>
      </div>

      {/* Price Range Slider */}
      <FilterSection title="Price Range" defaultOpen={true}>
        <div className="space-y-5">
          {/* Labels */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold tabular-nums">{formatINR(priceMin)}</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">to</span>
            <span className="text-sm font-semibold tabular-nums">{formatINR(priceMax)}</span>
          </div>

          {/* Dual Range Track */}
          <div className="relative h-6 flex items-center">
            {/* Background track */}
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            {/* Active range fill */}
            <div
              className="absolute h-1.5 rounded-full bg-[#E63946]"
              style={{
                left: `${((priceMin - sliderMin) / (sliderMax - sliderMin)) * 100}%`,
                right: `${100 - ((priceMax - sliderMin) / (sliderMax - sliderMin)) * 100}%`,
              }}
            />
            {/* Min thumb */}
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={PRICE_STEP}
              value={priceMin}
              onChange={e => handlePriceMin(Number(e.target.value))}
              className="price-range-thumb absolute inset-x-0"
            />
            {/* Max thumb */}
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={PRICE_STEP}
              value={priceMax}
              onChange={e => handlePriceMax(Number(e.target.value))}
              className="price-range-thumb absolute inset-x-0"
            />
          </div>

          {/* Reset link */}
          {priceIsFiltered && (
            <button
              onClick={resetPrice}
              className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 hover:text-[#E63946] transition-colors"
            >
              Reset Price
            </button>
          )}
        </div>
      </FilterSection>

      {/* Size Filter */}
      <FilterSection title="Size" defaultOpen={true}>
        <div className="flex flex-wrap gap-2">
          {visibleSizes.map(size => {
            const isActive = currentSizes.includes(size);
            const displaySize = size.replace(/^UK\s*/i, '');
            return (
              <button
                key={size}
                onClick={() => toggleFilter('size', size)}
                className={twMerge(
                  "min-w-[3rem] px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 border",
                  isActive
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900 dark:border-white font-bold"
                    : "bg-transparent text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white"
                )}
              >
                {displaySize}
              </button>
            );
          })}
        </div>
        {displaySizes.length > 12 && (
          <button
            onClick={() => setShowAllSizes(!showAllSizes)}
            className="mt-3 text-xs font-bold text-neutral-400 hover:text-[#E63946] transition-colors uppercase tracking-wider"
          >
            {showAllSizes ? 'Show Less' : `+ ${displaySizes.length - 12} More`}
          </button>
        )}
      </FilterSection>

      {/* Brand Filter */}
      <FilterSection title="Brands" defaultOpen={true}>
        <div className="space-y-3">
          {BRANDS.map(brand => (
            <CheckboxItem
              key={brand}
              label={brand}
              isActive={currentBrands.includes(brand)}
              onChange={() => toggleFilter('brand', brand)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Category Filter */}
      <FilterSection title="Category" defaultOpen={true}>
        <div className="space-y-3">
          {CATEGORIES.map(category => (
            <CheckboxItem
              key={category}
              label={category}
              isActive={currentCategories.some(c => c.toLowerCase() === category.toLowerCase())}
              onChange={() => toggleFilter('category', category)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full py-3 text-xs font-bold uppercase tracking-wider text-[#E63946] border border-[#E63946]/20 rounded-lg hover:bg-[#E63946]/10 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <X size={12} />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-full hidden lg:block">
        <h2 className="text-lg font-bold mb-6 uppercase tracking-wide flex items-center gap-2">
          <SlidersHorizontal size={18} />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 text-[10px] bg-[#E63946] text-white w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </h2>
        {filterContent}
      </aside>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full shadow-2xl shadow-black/30 font-bold text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform"
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-[#E63946] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div
            ref={mobileRef}
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-950 rounded-t-3xl max-h-[85vh] overflow-y-auto overscroll-contain animate-slide-up shadow-2xl"
          >
            {/* Handle & Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-neutral-950 px-6 pt-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                  <SlidersHorizontal size={18} />
                  Filters
                </h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="px-6 py-6">
              {filterContent}
            </div>
            {/* Sticky Apply Button */}
            <div className="sticky bottom-0 bg-white dark:bg-neutral-950 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider text-sm rounded-full hover:bg-[#E63946] dark:hover:bg-[#E63946] dark:hover:text-white transition-colors"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
