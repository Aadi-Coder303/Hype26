'use client';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface ImageGalleryProps {
  images: string[];
  altText: string;
}

export default function ImageGallery({ images, altText }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Force only the first image to avoid watermarked secondary images
  const displayImages = images.length > 0 ? [images[0]] : [''];

  const switchImage = (idx: number) => {
    // Disabled since we only show 1 image
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image */}
      <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 w-full overflow-hidden flex items-center justify-center group">
        {displayImages[activeIndex] && displayImages[activeIndex].startsWith('http') ? (
          <img 
            src={displayImages[activeIndex]} 
            alt={`${altText} - View ${activeIndex + 1}`} 
            className={twMerge(
              "w-full h-full object-cover transition-all duration-300",
              isTransitioning ? "opacity-0 scale-[1.06]" : "opacity-100 scale-[1.04]"
            )}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <span className="text-neutral-400 text-sm uppercase tracking-wider">Coming Soon</span>
        )}

        {/* Removed image counter since we only display the first image */}

        {/* Watermark-hiding SoleVault Badge */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-2 py-1 rounded shadow-md border border-neutral-200/50 dark:border-neutral-700/50">
          <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[10px] font-black tracking-widest uppercase text-neutral-800 dark:text-neutral-200">SoleVault Verified</span>
        </div>
      </div>

      {/* Thumbnails removed to hide watermarked secondary images */}
    </div>
  );
}
