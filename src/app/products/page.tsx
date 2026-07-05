import FilterSidebar from '@/components/FilterSidebar';
import LoadMoreProducts from '@/components/LoadMoreProducts';
import ProductSort from '@/components/ProductSort';
import { shopifyFetch } from '@/lib/shopify';
import { getProductsQuery } from '@/lib/shopify/queries/product';
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

  const queryParts = [];
  if (brand) queryParts.push(`vendor:${brand}`);
  if (category && category !== 'sale') queryParts.push(`title:*${category}*`);
  if (inStockFilter) queryParts.push(`available_for_sale:true`);
  if (priceFilter) {
    const [min, max] = priceFilter.split('-');
    if (min && max) {
      queryParts.push(`variants.price:>=${min} AND variants.price:<=${max}`);
    } else if (min) {
      queryParts.push(`variants.price:>=${min}`);
    }
  }
  const shopifyQuery = queryParts.join(' AND ');

  let sortKey = 'RELEVANCE';
  let reverse = false;
  if (sort === 'price-asc') {
    sortKey = 'PRICE';
    reverse = false;
  } else if (sort === 'price-desc') {
    sortKey = 'PRICE';
    reverse = true;
  } else if (sort === 'newest') {
    sortKey = 'CREATED_AT';
    reverse = true;
  }

  // Fetch products from Shopify
  const { body: productsData } = await shopifyFetch<any>({
    query: getProductsQuery,
    variables: { 
      first: PAGE_SIZE,
      query: shopifyQuery,
      sortKey,
      reverse
    }
  });

  const productNodes = productsData?.data?.products?.edges?.map((e: any) => e.node) || [];
  let products = productNodes.map((node: any) => ({
    id: node.handle,
    name: node.title,
    brand: node.vendor,
    price: parseFloat(node.priceRange.minVariantPrice.amount),
    imageUrl: node.images?.edges?.[0]?.node?.url || '',
    sizes: node.variants?.edges?.reduce((acc: any, edge: any) => {
      acc[edge.node.title] = {
        stock: edge.node.availableForSale ? 10 : 0,
        price: parseFloat(edge.node.price.amount),
        variantId: edge.node.id,
      };
      return acc;
    }, {}) || {}
  }));

  const totalCount = products.length;
  const paginatedProducts = products;

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
          initialProducts={paginatedProducts.map((p: any) => ({ ...p, imageUrl: p.imageUrl, sizes: p.sizes as Record<string, number | { stock: number; price: number }> }))} 
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
          queryParams={qp.toString()}
        />
      </div>
    </main>
  );
}
