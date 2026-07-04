'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const messages = [
  '🔥 Free Shipping on all orders across India',
  '✅ 100% Authentic — Every pair verified before dispatch',
  '⚡ Ships within 24 hours of order confirmation',
  '🎁 Use code SOLEVAULT10 for 10% off your first order',
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [idx, setIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-rotate messages every 4 seconds
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % messages.length);
        setIsAnimating(false);
      }, 200);
    }, 4000);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="bg-neutral-950 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-0 sm:h-9 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex-1 flex items-center justify-center gap-3 sm:gap-6 min-w-0">
          <button
            onClick={() => {
              setIsAnimating(true);
              setTimeout(() => {
                setIdx((i) => (i - 1 + messages.length) % messages.length);
                setIsAnimating(false);
              }, 200);
            }}
            className="text-white/40 hover:text-white transition-colors shrink-0 hidden sm:block"
            aria-label="Previous message"
          >
            ‹
          </button>
          <span 
            className={`text-center leading-snug transition-all duration-200 ${isAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
          >
            {messages[idx]}
          </span>
          <button
            onClick={() => {
              setIsAnimating(true);
              setTimeout(() => {
                setIdx((i) => (i + 1) % messages.length);
                setIsAnimating(false);
              }, 200);
            }}
            className="text-white/40 hover:text-white transition-colors shrink-0 hidden sm:block"
            aria-label="Next message"
          >
            ›
          </button>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-white/40 hover:text-white transition-colors shrink-0"
          aria-label="Close announcement"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
