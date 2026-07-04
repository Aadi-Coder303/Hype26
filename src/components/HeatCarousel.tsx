'use client';

import { useRef, useState, useEffect } from 'react';
import ProductCard from './ProductCard';

interface HeatCarouselProps {
  products: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    sizes: Record<string, number | { stock: number; price: number }>;
  }[];
}

export default function HeatCarousel({ products }: HeatCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [scrollX, setScrollX] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setScrollX(el.scrollLeft);
      setContainerWidth(el.clientWidth);
      setScrollWidth(el.scrollWidth);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const canScrollLeft = scrollX > 10;
  const canScrollRight = scrollX < scrollWidth - containerWidth - 10;

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative group/carousel">
      {/* Scroll Arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 shadow-lg opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll left"
        >
          ←
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 shadow-lg opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll right"
        >
          →
        </button>
      )}

      {/* Cards Container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-5 px-8 pb-8 pt-4 snap-x snap-mandatory scrollbar-hide"
        style={{ perspective: '1000px' }}
      >
        {products.map((p, i) => {
          const isHovered = hoveredIndex === i;
          // Each neighbour of the hovered card shrinks a bit
          const isNeighbour = hoveredIndex !== null && Math.abs(hoveredIndex - i) === 1;
          
          let scale = 1;
          let translateY = 0;
          let rotateY = 0;
          let zIndex = 1;
          let shadow = '';

          if (isHovered) {
            scale = 1.15;
            translateY = -12;
            zIndex = 30;
            shadow = '0 25px 60px -10px rgba(0,0,0,0.3)';
          } else if (isNeighbour) {
            scale = 0.95;
            rotateY = hoveredIndex !== null && i < hoveredIndex ? 6 : -6;
            zIndex = 10;
          }

          return (
            <div
              key={p.id}
              className={`w-[260px] sm:w-[280px] lg:w-[300px] shrink-0 snap-center animate-fade-in stagger-${(i % 10) + 1}`}
              style={{
                transform: `perspective(800px) scale(${scale}) translateY(${translateY}px) rotateY(${rotateY}deg)`,
                zIndex,
                boxShadow: shadow,
                transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease',
                transformOrigin: 'center bottom',
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Fixed-height card wrapper to ensure uniform sizing */}
              <div className="h-[420px] sm:h-[440px] flex flex-col">
                <ProductCard
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  imageUrl={p.imageUrl || ''}
                  sizes={p.sizes}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
