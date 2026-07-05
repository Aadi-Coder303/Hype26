import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';
import { getProductsQuery } from '@/lib/shopify/queries/product';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '250', 10);
    
    // Fetch products from Shopify
    const { body } = await shopifyFetch<any>({
      query: getProductsQuery,
      variables: { first: limit }
    });

    const productNodes = body?.data?.products?.edges?.map((e: any) => e.node) || [];
    const products = productNodes.map((node: any) => ({
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

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
