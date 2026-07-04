'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const HERO_BACKGROUNDS = [
  'https://cdn.shopify.com/s/files/1/0360/6491/9692/files/1_7025dff6-2073-4439-a383-6cf4f3061853.png?v=1755093992',
  'https://cdn.shopify.com/s/files/1/0360/6491/9692/files/6841.png?v=1755096173',
  'https://cdn.shopify.com/s/files/1/0360/6491/9692/files/adidas-samba-og-black-white-gum-sneakers-crepdog-crew-1.png?v=1711718042',
];

const ScrollingSkeleton = () => (
  <div className="absolute inset-0 z-[5] overflow-hidden opacity-10 pointer-events-none">
    <div className="flex h-full w-[200vw] animate-marquee will-change-transform">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-1 h-full relative">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none" stroke="white" strokeWidth="0.5">
            <path d="M0,200 Q250,500 500,200 T1000,200" strokeDasharray="5,5" />
            <path d="M0,800 Q250,500 500,800 T1000,800" strokeDasharray="5,5" />
            <circle cx="500" cy="500" r="300" strokeDasharray="10,20" />
            <path d="M200,500 L800,500" />
          </svg>
        </div>
      ))}
    </div>
  </div>
);

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setBgIndex(prev => (prev + 1) % HERO_BACKGROUNDS.length);
        setIsFading(false);
      }, 600);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-neutral-950">
      
      {/* Editorial Background Images */}
      {HERO_BACKGROUNDS.map((url, i) => (
        <div
          key={url}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[2000ms] ease-out-expo"
          style={{
            backgroundImage: `url('${url}')`,
            opacity: bgIndex === i ? (isFading ? 0 : 1) : 0,
            transform: bgIndex === i ? 'scale(1.02)' : 'scale(1.08)',
          }}
        />
      ))}

      {/* Elegant Dark Gradient Overlays for Readability */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />

      {/* Scrolling Skeleton Animation Layer */}
      <ScrollingSkeleton />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center mt-20">
        
        <div
          className="transition-all duration-1000 ease-out"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <span className="inline-block text-white text-[10px] sm:text-xs font-semibold uppercase tracking-[0.4em] mb-8 px-4 py-1.5 border border-white/20 rounded-full backdrop-blur-sm">
            India's Premium Destination
          </span>
        </div>

        <div
          className="transition-all duration-1000 ease-out delay-150"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transitionDelay: '150ms' }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-serif font-normal tracking-tight text-white mb-6 leading-[1.1]">
            The Authentic <br className="hidden sm:block" />
            <span className="italic opacity-90">Sneaker Vault.</span>
          </h1>
        </div>

        <div
          className="transition-all duration-1000 ease-out"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transitionDelay: '300ms' }}
        >
          <p className="text-sm md:text-base text-neutral-300 mb-12 max-w-lg mx-auto leading-relaxed font-light tracking-wide">
            Exclusive sneakers sourced globally. Verified authentic, delivered seamlessly to your door.
          </p>
        </div>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transitionDelay: '450ms', transition: 'all 1s ease-out' }}
        >
          <Link
            href="/products"
            className="group inline-flex items-center justify-center gap-2 bg-white text-black px-10 py-4 rounded-full font-medium uppercase tracking-[0.2em] text-xs hover:bg-neutral-200 transition-all duration-300 shadow-lg"
          >
            Explore Now
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/authenticity"
            className="inline-flex items-center justify-center gap-2 bg-transparent border border-white/30 text-white px-10 py-4 rounded-full font-medium uppercase tracking-[0.2em] text-xs hover:bg-white/10 hover:border-white transition-all duration-300"
          >
            Authenticity
          </Link>
        </div>
      </div>

      {/* Minimal Background Indicator Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {HERO_BACKGROUNDS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIsFading(true); setTimeout(() => { setBgIndex(i); setIsFading(false); }, 400); }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${bgIndex === i ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </section>
  );
}
