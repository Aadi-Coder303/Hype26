'use client';

import ProductCard from '@/components/ProductCard';

interface RecommendedProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string | null;
  sizes: any;
}

interface ProductRecommendationsProps {
  moreBrand: RecommendedProduct[];
  alsoBought: RecommendedProduct[];
  youMayLike: RecommendedProduct[];
  brandName: string;
}

function RecommendationRow({ title, subtitle, products }: { title: string; subtitle: string; products: RecommendedProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 border-t border-neutral-100 dark:border-neutral-800">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E63946] mb-1">{subtitle}</p>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">{title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((p, i) => (
            <div
              key={p.id}
              className="animate-scroll-appear"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <ProductCard
                id={p.id}
                name={p.name}
                price={p.price}
                imageUrl={p.imageUrl || ''}
                sizes={p.sizes as Record<string, number | { stock: number; price: number }>}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProductRecommendations({ moreBrand, alsoBought, youMayLike, brandName }: ProductRecommendationsProps) {
  // Don't render the wrapper if there are no recommendations at all
  if (moreBrand.length === 0 && alsoBought.length === 0 && youMayLike.length === 0) return null;

  return (
    <div className="bg-white dark:bg-neutral-950">
      <RecommendationRow
        title={`More From ${brandName}`}
        subtitle="Same Brand"
        products={moreBrand}
      />
      <RecommendationRow
        title="People Also Bought"
        subtitle="Frequently Purchased Together"
        products={alsoBought}
      />
      <RecommendationRow
        title="You May Also Like"
        subtitle="Curated For You"
        products={youMayLike}
      />
    </div>
  );
}
