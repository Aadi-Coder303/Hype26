'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import { Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  sizes: Record<string, number | { stock: number; price: number }>;
}

interface LoadMoreProductsProps {
  initialProducts: Product[];
  totalCount: number;
  pageSize: number;
  queryParams: string; // e.g. "category=Men&brand=Nike&sort=price_asc"
}

export default function LoadMoreProducts({ initialProducts, totalCount, pageSize, queryParams }: LoadMoreProductsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const hasMore = products.length < totalCount;

  // Extract active size filter from query params (only use first size for price display)
  const activeSize = new URLSearchParams(queryParams).get('size')?.split(',')[0] || undefined;

  const loadMore = async () => {
    setIsLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/products?page=${nextPage}&limit=${pageSize}&${queryParams}`);
      const data = await res.json();
      if (data.products) {
        setProducts(prev => [...prev, ...data.products]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Failed to load more products', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
        {products.map((p, i) => (
          <div key={p.id} className={`animate-fade-in stagger-${(i % 10) + 1} flex flex-col h-full`}>
            <ProductCard
              id={p.id}
              name={p.name}
              price={p.price}
              imageUrl={p.imageUrl || ''}
              sizes={p.sizes}
              activeSize={activeSize}
            />
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-12 text-center text-neutral-500">
            No products found matching your filters.
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider text-sm hover:bg-[#E63946] dark:hover:bg-[#E63946] dark:hover:text-white transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isLoading ? 'Loading…' : `Load More (${products.length} of ${totalCount})`}
          </button>
        </div>
      )}
    </>
  );
}
