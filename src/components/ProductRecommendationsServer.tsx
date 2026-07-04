import prisma from '@/lib/prisma';
import ProductRecommendations from './ProductRecommendations';

interface ProductRecommendationsServerProps {
  productId: string;
  brand: string;
  category: string;
  colorVariantIds: string[];
}

export default async function ProductRecommendationsServer({
  productId,
  brand,
  category,
  colorVariantIds,
}: ProductRecommendationsServerProps) {
  const excludeIds = [productId, ...colorVariantIds];

  // 1. "More From [Brand]"
  const moreBrandPromise = prisma.product.findMany({
    where: {
      brand: { equals: brand, mode: 'insensitive' },
      id: { notIn: excludeIds },
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  // 2. "People Also Bought"
  const alsoBoughtPromise = (async () => {
    let alsoBought: any[] = [];
    try {
      const ordersWithProduct = await prisma.order.findMany({
        where: {
          status: { in: ['paid', 'confirmed', 'shipped', 'delivered'] },
        },
        select: { items: true },
        take: 30, // Reduced from 100 to make it faster
        orderBy: { createdAt: 'desc' },
      });

      const coProductIds = new Set<string>();
      for (const order of ordersWithProduct) {
        const items = order.items as Array<{ productId: string }>;
        if (!Array.isArray(items)) continue;
        const hasThisProduct = items.some(i => i.productId === productId);
        if (hasThisProduct) {
          items.forEach(i => {
            if (i.productId && i.productId !== productId && !excludeIds.includes(i.productId)) {
              coProductIds.add(i.productId);
            }
          });
        }
      }

      if (coProductIds.size > 0) {
        alsoBought = await prisma.product.findMany({
          where: { id: { in: Array.from(coProductIds).slice(0, 4) } },
        });
      }
    } catch (e) {
      console.error('Also bought query error:', e);
    }
    return alsoBought;
  })();

  const [moreBrand, alsoBought] = await Promise.all([moreBrandPromise, alsoBoughtPromise]);

  // 3. "You May Also Like"
  const alreadyShownIds = [...excludeIds, ...moreBrand.map((p: any) => p.id), ...alsoBought.map((p: any) => p.id)];
  const youMayLike = await prisma.product.findMany({
    where: {
      category: { equals: category, mode: 'insensitive' },
      id: { notIn: alreadyShownIds },
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <ProductRecommendations
      moreBrand={moreBrand}
      alsoBought={alsoBought}
      youMayLike={youMayLike}
      brandName={brand}
    />
  );
}
