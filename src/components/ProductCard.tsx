'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Heart } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  sizes?: Record<string, number | { stock: number; price: number }>;
  activeSize?: string; // from size filter — show this size's price, not range
}

export default function ProductCard({ id, name, price, originalPrice, imageUrl, sizes, activeSize }: ProductCardProps) {
  const { toggleItem, hasItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Extract available sizes from JSON object (supports both formats)
  const availableSizes = sizes ? Object.keys(sizes).filter(size => {
    const val = sizes[size];
    return typeof val === 'object' ? val.stock > 0 : (val as number) > 0;
  }) : [];
  const totalStock = sizes ? Object.values(sizes).reduce((a: number, b) => a + (typeof b === 'object' ? b.stock : (b as number)), 0) : 0;

  // Calculate price range for display
  const sizePrices = sizes ? Object.entries(sizes)
    .filter(([, v]) => typeof v === 'object' ? v.stock > 0 : (v as number) > 0)
    .map(([, v]) => typeof v === 'object' ? v.price : price)
    .filter(p => p > 0) : [];
  const minPrice = sizePrices.length > 0 ? Math.min(...sizePrices) : price;
  const maxPrice = sizePrices.length > 0 ? Math.max(...sizePrices) : price;

  // When a size filter is active, show that size's specific price
  let activeSizePrice: number | null = null;
  if (activeSize && sizes) {
    const val = sizes[activeSize];
    if (val !== undefined) {
      activeSizePrice = typeof val === 'object' ? val.price : price;
    }
  }
  const hasPriceRange = activeSizePrice === null && minPrice !== maxPrice;

  // Build product link — append ?size= when a size filter is active
  const productHref = activeSize ? `/products/${id}?size=${encodeURIComponent(activeSize)}` : `/products/${id}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const [showSizes, setShowSizes] = useState(false);

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSizes(true);
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sizeVal = sizes?.[size];
    const sizePrice = sizeVal && typeof sizeVal === 'object' ? sizeVal.price : price;
    addItem({
      id: `${id}-${size}`,
      productId: id,
      name,
      price: sizePrice,
      size,
      imageUrl: imageUrl || '',
    });
    toast.success(`Added size ${size} to bag!`);
    setShowSizes(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(id);
  };

  const isWishlisted = mounted && hasItem(id);

  return (
    <div className="group relative flex flex-col bg-transparent">
      
      {/* Wishlist Icon */}
      <button 
        onClick={handleWishlist}
        className={twMerge(
          "absolute top-3 right-3 z-30 p-2 rounded-full bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md hover:bg-white dark:hover:bg-neutral-900 active:scale-95 transition-all duration-300",
          isWishlisted ? "text-neutral-900 dark:text-white" : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
        )}
      >
        <Heart size={16} className={twMerge("sm:w-5 sm:h-5", isWishlisted ? "fill-current" : "")} />
      </button>

      {/* Out of stock badge */}
      {totalStock === 0 && (
        <div className="absolute top-3 left-3 z-30 bg-neutral-900/90 dark:bg-neutral-100/90 text-white dark:text-black text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.2em] px-3 py-1.5 rounded-full animate-fade-in backdrop-blur-sm">
          Sold Out
        </div>
      )}

      {/* Low stock badge */}
      {totalStock > 0 && totalStock <= 3 && (
        <div className="absolute top-3 left-3 z-30 bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.2em] px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Only {totalStock} left
        </div>
      )}

      {/* Unified Hover Container */}
      <div className="flex flex-col transition-all duration-500 ease-out-expo group-hover:-translate-y-2 group-hover:scale-[1.02]">
        {/* Image Area */}
        <Link href={productHref} className="block relative aspect-[4/5] bg-neutral-100/50 dark:bg-neutral-800/30 overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm group-hover:shadow-xl dark:group-hover:shadow-neutral-900/50 transition-shadow duration-500">
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
            {imageUrl ? (
              <>
                {!imgLoaded && <div className="absolute inset-0 shimmer" />}
                <img 
                  src={imageUrl.split(',')[0].trim()} 
                  alt={name} 
                  className={twMerge(
                    "object-contain w-full h-full p-2 sm:p-4 group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply dark:mix-blend-normal",
                    imgLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImgLoaded(true)}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                
                {/* Watermark-hiding SoleVault Badge */}
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl px-3 py-1.5 rounded-full shadow-sm">
                  <svg className="w-2.5 h-2.5 text-neutral-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100">Verified</span>
                </div>
              </>
            ) : (
              <span className="text-xs uppercase tracking-wider">No Image</span>
            )}
          </div>
          
          {/* Quick Add CTA on Hover (Desktop Only) */}
          <div className="hidden lg:block absolute bottom-0 left-0 w-full p-3 sm:p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out z-20">
            {showSizes ? (
              <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-2xl p-2.5 sm:p-3 flex gap-1.5 sm:gap-2 justify-center flex-wrap shadow-xl shadow-black/5" onClick={(e) => e.preventDefault()}>
                {availableSizes.length > 0 ? availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => handleSizeSelect(e, size)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-[10px] sm:text-xs font-medium hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200"
                  >
                    {size.replace('UK ', '')}
                  </button>
                )) : (
                  <span className="text-xs font-medium text-neutral-500 py-2 px-4 bg-neutral-100 dark:bg-neutral-800 rounded-full">Sold Out</span>
                )}
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSizes(false); }}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-all ml-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button 
                onClick={handleQuickAddClick}
                disabled={availableSizes.length === 0}
                className="w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl text-neutral-900 dark:text-white py-3.5 rounded-full text-xs font-semibold tracking-[0.15em] uppercase hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 disabled:opacity-0 shadow-lg shadow-black/5"
              >
                {availableSizes.length === 0 ? 'Sold Out' : 'Quick Add'}
              </button>
            )}
          </div>
        </Link>

        {/* Info Area */}
        <div className="pt-4 sm:pt-5 pb-2 flex flex-col gap-1 sm:gap-1.5 px-1 items-center text-center">
          <Link href={productHref} className="w-full">
            <h3 className="font-serif font-normal text-sm sm:text-base text-neutral-900 dark:text-neutral-100 truncate w-full hover:text-neutral-500 transition-colors duration-200">{name}</h3>
          </Link>
          
          <div className="flex items-center justify-center gap-2 mt-1 sm:mt-1.5">
            {activeSizePrice !== null ? (
              <span className="font-medium text-sm sm:text-[15px] tracking-wide">{formatCurrency(activeSizePrice)}</span>
            ) : hasPriceRange ? (
              <span className="font-medium text-sm sm:text-[15px] tracking-wide">{formatCurrency(minPrice)} – {formatCurrency(maxPrice)}</span>
            ) : (
              <span className="font-medium text-sm sm:text-[15px] tracking-wide">{formatCurrency(price)}</span>
            )}
            {originalPrice && (
              <span className="text-[11px] sm:text-xs text-neutral-400 line-through tracking-wide">{formatCurrency(originalPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
