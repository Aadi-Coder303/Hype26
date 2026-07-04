import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://solevault.com';

  // Fetch all product IDs
  const products = await prisma.product.findMany({
    select: { id: true, updatedAt: true },
  });

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const staticPages = [
    '',
    '/products',
    '/authenticity',
    '/faq',
    '/shipping',
    '/contact',
    '/privacy',
    '/terms',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: page === '' ? 1.0 : 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
