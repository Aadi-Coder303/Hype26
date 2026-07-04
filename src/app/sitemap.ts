import { MetadataRoute } from 'next';
import { shopifyFetch } from '@/lib/shopify';
import { getProductsQuery } from '@/lib/shopify/queries/product';

const BASE_URL = 'https://hype26.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    '',
    '/products',
    '/cart',
    '/search',
    '/faq',
    '/contact',
    '/shipping',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    const { body } = await shopifyFetch<any>({
      query: getProductsQuery,
      variables: { first: 100 }
    });

    const productNodes = body?.data?.products?.edges?.map((e: any) => e.node) || [];

    const productRoutes = productNodes.map((product: any) => ({
      url: `${BASE_URL}/products/${product.handle}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...routes, ...productRoutes];
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return routes; // Return basic routes if Shopify fails
  }
}
