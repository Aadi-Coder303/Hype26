import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/products/filters
 * Returns dynamic filter facets: available sizes, price range, and sub-categories
 * derived from the current product inventory.
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        sizes: true,
        price: true,
        name: true,
      },
    });

    // --- Collect all unique sizes ---
    const sizeSet = new Set<string>();
    products.forEach(p => {
      const sizes = p.sizes as Record<string, any> | null;
      if (sizes) {
        Object.keys(sizes).forEach(s => sizeSet.add(s));
      }
    });

    // Sort sizes numerically (strip "UK " prefix if present)
    const allSizes = Array.from(sizeSet).sort((a, b) => {
      const numA = parseFloat(a.replace(/^UK\s*/i, ''));
      const numB = parseFloat(b.replace(/^UK\s*/i, ''));
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });

    // --- Price range ---
    const prices = products.map(p => p.price).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 50000;

    // --- Sub-categories (derived from product names) ---
    const subCategoryKeywords: Record<string, string[]> = {
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

    const subCategoryCounts: Record<string, number> = {};
    products.forEach(p => {
      const nameLower = p.name.toLowerCase();
      for (const [label, keywords] of Object.entries(subCategoryKeywords)) {
        if (keywords.some(kw => nameLower.includes(kw))) {
          subCategoryCounts[label] = (subCategoryCounts[label] || 0) + 1;
        }
      }
    });

    // Only return sub-categories that have at least 1 product
    const subCategories = Object.entries(subCategoryCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));

    return NextResponse.json({
      sizes: allSizes,
      priceRange: { min: minPrice, max: maxPrice },
      subCategories,
    });
  } catch (error: any) {
    console.error('Failed to fetch filter facets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}
