import LoadMoreProducts from '@/components/LoadMoreProducts';
import FilterSidebar from '@/components/FilterSidebar';
import ProductSort from '@/components/ProductSort';
import { Search as SearchIcon } from 'lucide-react';
import prisma from '@/lib/prisma';
import { Suspense } from 'react';

export const revalidate = 60;

const PAGE_SIZE = 24;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const category = typeof params.category === 'string' ? params.category : undefined;
  const brand = typeof params.brand === 'string' ? params.brand : undefined;
  const sort = typeof params.sort === 'string' ? params.sort : undefined;

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };

  const where: any = {};
  
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { brand: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (category && category.toLowerCase() !== 'sale') {
    const categories = category.split(',').map(c => c.trim());
    where.category = { in: categories, mode: 'insensitive' };
  }
  
  if (brand) {
    const brands = brand.split(',').map(b => b.trim());
    where.brand = { in: brands, mode: 'insensitive' };
  }

  const hasFilters = brand || category;
  const shouldSearch = query || hasFilters;

  let results: any[] = [];
  let totalCount = 0;

  if (shouldSearch) {
    [results, totalCount] = await Promise.all([
      prisma.product.findMany({ where, orderBy, take: PAGE_SIZE }),
      prisma.product.count({ where }),
    ]);
  }

  // Build query params for client-side load more
  const qp = new URLSearchParams();
  if (query) qp.set('q', query);
  if (category) qp.set('category', category);
  if (brand) qp.set('brand', brand);
  if (sort) qp.set('sort', sort);

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 min-h-[70vh]">
      {/* Sidebar Filters */}
      <div className="hidden lg:block w-64 shrink-0">
        <Suspense fallback={<div>Loading filters...</div>}>
          <FilterSidebar />
        </Suspense>
      </div>

      {/* Product Grid */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              {query ? 'Search Results' : (hasFilters ? 'Filtered Results' : 'Search')}
            </h1>
            {query && (
              <p className="text-neutral-500 text-sm mt-1">
                Showing results for <span className="font-bold text-black dark:text-white">&quot;{query}&quot;</span> ({totalCount})
              </p>
            )}
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <ProductSort />
          </Suspense>
        </div>

        {!shouldSearch ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-200 dark:border-neutral-800">
            <SearchIcon size={48} className="text-neutral-300 dark:text-neutral-700 mb-4" />
            <h2 className="text-xl font-bold uppercase tracking-wide mb-2">Start Searching</h2>
            <p className="text-neutral-500 text-sm">
              Enter a brand or sneaker name in the top navigation, or use the filters on the left.
            </p>
          </div>
        ) : results.length > 0 ? (
          <LoadMoreProducts
            key={qp.toString()}
            initialProducts={results.map(p => ({ ...p, imageUrl: p.imageUrl, sizes: p.sizes as Record<string, number | { stock: number; price: number }> }))}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            queryParams={qp.toString()}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-200 dark:border-neutral-800">
            <SearchIcon size={48} className="text-neutral-300 dark:text-neutral-700 mb-4" />
            <h2 className="text-xl font-bold uppercase tracking-wide mb-2">No Results Found</h2>
            <p className="text-neutral-500 text-sm max-w-md">
              We couldn&apos;t find any sneakers matching your criteria. Try adjusting your filters or search term.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
