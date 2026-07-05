import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';
import { getProductsQuery } from '@/lib/shopify/queries/product';

export async function GET() {
  try {
    const { body } = await shopifyFetch<any>({
      query: getProductsQuery,
      variables: { first: 250 }
    });

    const products = body?.data?.products?.edges?.map((e: any) => e.node) || [];
    
    const sizesSet = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;
    
    products.forEach((node: any) => {
      const price = parseFloat(node.priceRange?.minVariantPrice?.amount || '0');
      if (price < minPrice) minPrice = price;
      if (price > maxPrice) maxPrice = price;
      
      node.variants?.edges?.forEach((edge: any) => {
        if (edge.node.availableForSale) {
          sizesSet.add(edge.node.title);
        }
      });
    });

    if (minPrice === Infinity) minPrice = 0;

    // Convert sizes back to array and sort them naturally
    const sizes = Array.from(sizesSet).sort((a, b) => {
      const numA = parseFloat(a.replace(/[^0-9.]/g, '')) || 0;
      const numB = parseFloat(b.replace(/[^0-9.]/g, '')) || 0;
      return numA - numB;
    });

    return NextResponse.json({
      sizes,
      priceRange: { min: minPrice, max: maxPrice },
      subCategories: []
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json({ sizes: [], priceRange: { min: 0, max: 100000 }, subCategories: [] }, { status: 500 });
  }
}
