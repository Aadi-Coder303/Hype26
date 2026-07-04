import FilterSidebar from '@/components/FilterSidebar';
import LoadMoreProducts from '@/components/LoadMoreProducts';
import ProductSort from '@/components/ProductSort';
import prisma from '@/lib/prisma';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { FilterSkeleton, Skeleton } from '@/components/Skeleton';

export async function generateMetadata({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}): Promise<Metadata> {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const brand = typeof params.brand === 'string' ? params.brand : undefined;

  let title = 'Premium Sneakers';
  if (brand && category) title = `${brand} ${category} Sneakers`;
  else if (brand) title = `${brand} Sneakers`;
  else if (category) title = `${category} Sneakers`;

  return {
    title,
    description: `Shop the latest ${title} at Sole Vault. 100% authentic sneakers with premium service.`,
  };
}

export const revalidate = 60;

const PAGE_SIZE = 24;

// Sub-category keyword mapping (must match the filters API)
const SUB_CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Dunk': ['dunk'],
  'Air Jordan': ['jordan', 'aj1', 'aj4', 'aj11'],
  'Air Max': ['air max', 'airmax'],
  'Air Force': ['air force', 'af1'],
  'Yeezy': ['yeezy'],
  'Slides': ['slide', 'slides'],
  'Forum': ['forum'],
  'NMD': ['nmd'],
  'Ultraboost': ['ultraboost', 'ultra boost'],
  'Cloudnova': ['cloudnova', 'cloud nova'],
  'Retro': ['retro'],
  '550': ['550'],
};

export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const brand = typeof params.brand === 'string' ? params.brand : undefined;
  const sort = typeof params.sort === 'string' ? params.sort : undefined;
  const sizeFilter = typeof params.size === 'string' ? params.size : undefined;
  const priceFilter = typeof params.price === 'string' ? params.price : undefined;
  const subCategoryFilter = typeof params.subcategory === 'string' ? params.subcategory : undefined;
  const inStockFilter = params.instock === '1';

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };

  const where: any = {};
  
  if (category && category.toLowerCase() !== 'sale') {
    const categories = category.split(',').map(c => c.trim());
    where.category = { in: categories, mode: 'insensitive' };
  }
  
  if (brand) {
    const brands = brand.split(',').map(b => b.trim());
    where.brand = { in: brands, mode: 'insensitive' };
  }

  // Price range filter
  if (priceFilter) {
    const [minStr, maxStr] = priceFilter.split('-');
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);
    if (!isNaN(min) && !isNaN(max)) {
      where.price = { gte: min, lte: max };
    }
  }

  // Sub-category filter (name-based keyword search)
  if (subCategoryFilter) {
    const subCats = subCategoryFilter.split(',').map(s => s.trim());
    const nameKeywords: string[] = [];
    subCats.forEach(sub => {
      const keywords = SUB_CATEGORY_KEYWORDS[sub];
      if (keywords) {
        nameKeywords.push(...keywords);
      }
    });
    if (nameKeywords.length > 0) {
      where.OR = nameKeywords.map(kw => ({
        name: { contains: kw, mode: 'insensitive' },
      }));
    }
  }

  // Fetch more products than needed so we can filter by size/stock client-side-ish
  // We overfetch for size/stock filtering since Prisma can't filter on JSON keys directly
  const needsPostFilter = !!sizeFilter || inStockFilter;
  const fetchLimit = needsPostFilter ? PAGE_SIZE * 10 : PAGE_SIZE;

  let [products, totalCountRaw] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: fetchLimit,
    }),
    prisma.product.count({ where }),
  ]);

  // Post-filter: Size filter (check JSON keys)
  if (sizeFilter) {
    const requestedSizes = sizeFilter.split(',').map(s => s.trim());
    products = products.filter(p => {
      const sizes = p.sizes as Record<string, any> | null;
      if (!sizes) return false;
      return requestedSizes.some(rs => {
        const val = sizes[rs];
        if (val === undefined) return false;
        if (typeof val === 'object') return val.stock > 0;
        return (val as number) > 0;
      });
    });
  }

  // Post-filter: In-stock filter
  if (inStockFilter) {
    products = products.filter(p => {
      const sizes = p.sizes as Record<string, any> | null;
      if (!sizes) return false;
      return Object.values(sizes).some(val => {
        if (typeof val === 'object') return val.stock > 0;
        return (val as number) > 0;
      });
    });
  }

  const totalCount = needsPostFilter ? products.length : totalCountRaw;
  const paginatedProducts = products.slice(0, PAGE_SIZE);

  // Build query params string for client-side load more
  const qp = new URLSearchParams();
  if (category) qp.set('category', category);
  if (brand) qp.set('brand', brand);
  if (sort) qp.set('sort', sort);
  if (sizeFilter) qp.set('size', sizeFilter);
  if (priceFilter) qp.set('price', priceFilter);
  if (subCategoryFilter) qp.set('subcategory', subCategoryFilter);
  if (inStockFilter) qp.set('instock', '1');

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="hidden lg:block w-64 shrink-0">
        <Suspense fallback={<FilterSkeleton />}>
          <FilterSidebar />
        </Suspense>
      </div>

      {/* Mobile Filter (renders inside FilterSidebar as a floating button + drawer) */}
      <div className="lg:hidden">
        <Suspense fallback={null}>
          <FilterSidebar />
        </Suspense>
      </div>

      {/* Product Grid */}
      <div className="flex-1">
        <Breadcrumbs items={[{ label: 'Products' }]} />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            {category ? `${category} Sneakers` : 'All Sneakers'}
            <span className="text-sm font-normal text-neutral-400 ml-2">({totalCount})</span>
          </h1>
          <Suspense fallback={<Skeleton className="h-10 w-40" />}>
            <ProductSort />
          </Suspense>
        </div>
        
        <LoadMoreProducts 
          key={qp.toString()}
          initialProducts={paginatedProducts.map(p => ({ ...p, imageUrl: p.imageUrl, sizes: p.sizes as Record<string, number | { stock: number; price: number }> }))} 
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
          queryParams={qp.toString()}
        />
      </div>
    </main>
  );
}
