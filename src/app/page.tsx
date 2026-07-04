import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import BrandTicker from '@/components/BrandTicker';
import HeatCarousel from '@/components/HeatCarousel';
import LookbookGrid from '@/components/LookbookGrid';
import ScrollReveal from '@/components/ScrollReveal';
import { shopifyFetch } from '@/lib/shopify';
import { getProductsQuery } from '@/lib/shopify/queries/product';

export const revalidate = 60;

export default async function Home() {
  // Fetch items for Top Picks via Shopify
  const { body: topPicksData } = await shopifyFetch<any>({
    query: getProductsQuery,
    variables: { first: 8 }
  });
  const topPicksNodes = topPicksData?.data?.products?.edges?.map((e: any) => e.node) || [];
  const topPicks = topPicksNodes.map((node: any) => ({
    id: node.handle,
    name: node.title,
    brand: node.vendor,
    price: parseFloat(node.priceRange.minVariantPrice.amount),
    imageUrl: node.images?.edges?.[0]?.node?.url || '',
    sizes: node.variants?.edges?.reduce((acc: any, edge: any) => {
      acc[edge.node.title] = edge.node.availableForSale ? 10 : 0;
      return acc;
    }, {}) || {}
  }));

  // Fetch products for lookbook
  const { body: lookbookData } = await shopifyFetch<any>({
    query: getProductsQuery,
    variables: { first: 12 }
  });
  const lookbookNodes = lookbookData?.data?.products?.edges?.map((e: any) => e.node) || [];
  const lookbookProducts = lookbookNodes.map((node: any) => ({
    id: node.handle,
    name: node.title,
    brand: node.vendor,
    price: parseFloat(node.priceRange.minVariantPrice.amount),
    imageUrl: node.images?.edges?.[0]?.node?.url || '',
    sizes: node.variants?.edges?.reduce((acc: any, edge: any) => {
      acc[edge.node.title] = edge.node.availableForSale ? 10 : 0;
      return acc;
    }, {}) || {}
  }));

  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      <HeroSection />
      <BrandTicker />

      {/* Trending Brands Quick Links */}
      <section className="py-12 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/20">
        <ScrollReveal>
          <div className="container mx-auto px-4">
            <p className="text-center text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-400 mb-8">Trending Labels</p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {['Jordan', 'Adidas', 'Nike', 'New Balance', 'On Running'].map((brand) => (
                <Link 
                  key={brand}
                  href={`/products?brand=${encodeURIComponent(brand)}`}
                  className="px-6 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full text-[11px] font-medium tracking-wider hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Dynamic Lookbook Grid with Shuffle */}
      <section className="py-24 sm:py-32 bg-white dark:bg-neutral-950 overflow-hidden">
        <ScrollReveal delay={100}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500 mb-4">Curated Selection</p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-neutral-900 dark:text-neutral-100">The Lookbook</h2>
            </div>
            
            <LookbookGrid products={lookbookProducts.map((p: any) => ({ ...p, imageUrl: p.imageUrl || '' }))} />
          </div>
        </ScrollReveal>
      </section>

      {/* Top Picks - 3D Barrel Roll Carousel */}
      <section className="py-24 bg-neutral-50/50 dark:bg-neutral-900/30 border-y border-neutral-100 dark:border-neutral-800 overflow-hidden">
        <ScrollReveal delay={200}>
          <div className="container mx-auto px-4 mb-16 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500 mb-3">Premium Selection</p>
              <h2 className="text-4xl lg:text-5xl font-serif font-normal tracking-tight text-neutral-900 dark:text-neutral-100">Top Picks</h2>
            </div>
            <Link
              href="/products"
              className="group text-[11px] font-medium uppercase tracking-widest text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700 px-6 py-2.5 rounded-full bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm"
            >
              Explore Collection
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
          </div>

          {topPicks.length > 0 ? (
            <HeatCarousel products={topPicks.map((p: any) => ({ ...p, imageUrl: p.imageUrl, sizes: p.sizes as Record<string, number | { stock: number; price: number }> }))} />
          ) : (
            <div className="w-full py-16 text-center text-neutral-400 text-sm uppercase tracking-widest">
              No products yet. Import some from the owner dashboard!
            </div>
          )}
        </ScrollReveal>
      </section>

      {/* Trust Badges - Asymmetric Fibonacci Grid */}
      <section className="py-20 bg-white dark:bg-neutral-950">
        <ScrollReveal delay={300}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
              {[
                { colSpan: 'md:col-span-5', icon: '✓', title: '100% Authentic', desc: 'Every pair verified by our expert team' },
                { colSpan: 'md:col-span-7', icon: '🚚', title: 'Express Delivery', desc: 'Pan India delivery within 3-5 business days' },
                { colSpan: 'md:col-span-8', icon: '🔒', title: 'Secure Vault', desc: 'Encrypted transactions powered by PayU' },
                { colSpan: 'md:col-span-4', icon: '↩', title: 'Easy Returns', desc: '7-day window' },
              ].map((b) => (
                <div key={b.title} className={`${b.colSpan} group flex flex-col items-start gap-4 p-8 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-500 rounded-[2rem] hover:shadow-lg`}>
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <span className="text-xl text-neutral-700 dark:text-neutral-200">{b.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-xs uppercase tracking-[0.2em] mt-2 text-neutral-900 dark:text-neutral-100">{b.title}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-widest font-medium leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
