'use client';

import ImageGallery from '@/components/ImageGallery';
import SizeSelector from '@/components/SizeSelector';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { formatCurrency } from '@/lib/formatCurrency';
import { useState, useEffect } from 'react';
import { Heart, ShieldCheck, Truck, RefreshCcw, Zap, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';


interface ProductData {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  imageUrl: string | null;
  sizes: any;
  colorName?: string | null;
  parentId?: string | null;
}

interface ColorVariant {
  id: string;
  name: string;
  colorName: string | null;
  imageUrl: string | null;
}

export default function ProductClient({ product, colorVariants = [] }: { product: ProductData; colorVariants?: ColorVariant[] }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [displayPrice, setDisplayPrice] = useState(product.price);
  const { addItem } = useCartStore();
  const { toggleItem, hasItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-select size from URL param (e.g. ?size=UK 8)
  const urlSize = searchParams.get('size');

  // Handle both size formats: plain number or { stock, price }
  const sizesMap = (product.sizes as Record<string, number | { stock: number; price: number }>) || {};

  useEffect(() => {
    setMounted(true);
    // Auto-select size from URL on mount
    if (urlSize && sizesMap[urlSize] !== undefined) {
      const val = sizesMap[urlSize];
      const sizePrice = typeof val === 'object' ? val.price : undefined;
      setSelectedSize(urlSize);
      setDisplayPrice(sizePrice || product.price);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalStock = Object.values(sizesMap).reduce((a: number, b) => {
    return a + (typeof b === 'object' ? b.stock : (b as number));
  }, 0);
  const isLowStock = totalStock > 0 && totalStock <= 5;

  const formattedSizes = Object.entries(sizesMap).map(([sizeLabel, val]) => {
    const stock = typeof val === 'object' ? val.stock : (val as number);
    const price = typeof val === 'object' ? val.price : undefined;
    return {
      id: sizeLabel,
      label: sizeLabel.replace('UK ', ''),
      available: stock > 0,
      stock,
      price,
    };
  });
  formattedSizes.sort((a, b) => parseFloat(a.label) - parseFloat(b.label));

  const imageUrls = product.imageUrl ? product.imageUrl.split(',') : [];
  const galleryImages = [...imageUrls, '', '', ''].slice(0, 4);

  const handleSizeSelect = (sizeId: string, price?: number) => {
    setSelectedSize(sizeId);
    setDisplayPrice(price || product.price);
  };

  const getCurrentPrice = () => {
    if (!selectedSize) return product.price;
    const val = sizesMap[selectedSize];
    if (typeof val === 'object' && val.price) return val.price;
    return product.price;
  };

  const handleAddToCart = () => {
    if (!selectedSize) return toast.error('Please select a size first.');
    const price = getCurrentPrice();
    const variantId = (sizesMap[selectedSize] as any)?.variantId || '';
    addItem({
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      variantId,
      name: product.name,
      price,
      size: selectedSize,
      imageUrl: product.imageUrl || '',
    });
    toast.success('Added to bag!');
  };

  const handleBuyNow = () => {
    if (!selectedSize) return toast.error('Please select a size first.');
    const price = getCurrentPrice();
    const variantId = (sizesMap[selectedSize] as any)?.variantId || '';
    addItem({
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      variantId,
      name: product.name,
      price,
      size: selectedSize,
      imageUrl: product.imageUrl || '',
    });
    router.push('/cart');
  };

  return (
    <main className="container mx-auto px-4 py-12 lg:py-20 flex flex-col items-center">
      
      {/* Top Info - Symmetrical and Centered */}
      <div className="w-full max-w-2xl text-center mb-10">
        <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-[0.3em] mb-3">{product.brand}</p>
        <h1 className="text-3xl lg:text-4xl font-normal font-serif tracking-tight mb-4 text-neutral-900 dark:text-neutral-100">{product.name}</h1>
        {product.colorName && (
          <p className="text-sm text-neutral-400 font-medium tracking-wide mb-6">{product.colorName}</p>
        )}
        <div className="flex items-center justify-center gap-3">
          <span className="text-xl font-medium tracking-wide">{formatCurrency(displayPrice)}</span>
          <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium px-3 py-1 rounded-full uppercase tracking-widest">Free Shipping</span>
        </div>
      </div>

      {/* Main Layout - Image, Actions, Description */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-16 max-w-[1400px] items-start justify-center">
        
        {/* Image Gallery */}
        <div className="lg:col-span-7 order-1 flex justify-center w-full">
          <div className="w-full rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2 sm:p-6 shadow-sm">
            <ImageGallery images={galleryImages} altText={product.name} />
          </div>
        </div>

        {/* Right: Info Stack (Buying Options) */}
        <div className="lg:col-span-5 order-2 lg:order-3 w-full max-w-md mx-auto lg:mx-0 flex flex-col bg-white dark:bg-neutral-950 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/50 dark:shadow-none">

        {/* Color Variants */}
        {colorVariants.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Available Colors</p>
            <div className="flex gap-2 flex-wrap">
              {colorVariants.map(v => {
                const isActive = v.id === product.id;
                const thumb = v.imageUrl ? v.imageUrl.split(',')[0].trim() : '';
                return (
                  <button
                    key={v.id}
                    onClick={() => { if (!isActive) router.push(`/products/${v.id}`); }}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                      isActive ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {thumb && v.imageUrl && v.imageUrl.startsWith('http') ? (
                      <img src={thumb} alt={v.colorName || v.name} className="w-6 h-6 object-cover rounded-full" />
                    ) : null}
                    <span className="tracking-wide">{v.colorName || 'Default'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock urgency */}
        {totalStock > 0 && (
          <div className={`flex items-center gap-2 text-xs font-medium tracking-wide mb-6 ${isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-green-400'}`} />
            {isLowStock ? `Only ${totalStock} available` : 'In Stock'}
          </div>
        )}

        {/* Size Selection */}
        <div className="mb-6">
          <SizeSelector sizes={formattedSizes} onSelect={handleSizeSelect} initialSize={urlSize || undefined} />
        </div>

        {/* CTAs - Pill Shaped & High Contrast */}
        <div className="flex flex-col gap-3 mb-10">
          <button
            onClick={handleBuyNow}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Zap size={14} className="fill-current" /> Buy Now
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white py-3.5 rounded-full font-bold uppercase tracking-[0.15em] text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              Add to Bag
            </button>
            <button
              onClick={() => toggleItem(product.id)}
              className="w-12 h-12 flex-shrink-0 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 flex justify-center items-center hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <Heart className={mounted && hasItem(product.id) ? "fill-current text-[#E63946]" : ""} size={16} />
            </button>
          </div>
        </div>

        {/* Trust Badges - Minimal */}
        <div className="grid grid-cols-3 gap-4 mb-4 pt-8 border-t border-neutral-100 dark:border-neutral-800">
          {[
            { icon: ShieldCheck, label: 'Authentic' },
            { icon: Truck, label: 'Fast Ship' },
            { icon: RefreshCcw, label: 'Returns' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-full">
                <Icon size={16} className="text-neutral-600 dark:text-neutral-400" strokeWidth={1.5} />
              </div>
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-500">{label}</span>
            </div>
          ))}
        </div>

        {/* WhatsApp CTA */}
        <a
          href={`/api/whatsapp?text=${encodeURIComponent(`Hi! I'm interested in ${product.name}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white py-3 rounded-full text-[10px] font-medium uppercase tracking-widest transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Ask us about this product
        </a>
      </div>
      </div>
    </main>
  );
}
