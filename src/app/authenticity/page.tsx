import { ShieldCheck, Search, Package, Zap } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authenticity Guarantee',
  description: 'Our foundation is authenticity. Every pair at Sole Vault undergoes a rigorous, multi-point verification process by our experts.',
};

export default function AuthenticityPage() {
  return (
    <main className="container mx-auto px-4 py-16 lg:py-24 max-w-5xl">
      <div className="text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 mb-6 shadow-sm">
          <ShieldCheck className="text-[#E63946]" size={32} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl lg:text-5xl font-serif font-normal tracking-tight text-neutral-900 dark:text-neutral-100 mb-6">
          Authenticity Guarantee
        </h1>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          At Sole Vault, authenticity is our foundation. Every pair undergoes a rigorous, 
          multi-point verification process by our experts to ensure you receive 100% genuine sneakers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
        {[
          {
            icon: Zap,
            title: "1. Sourcing",
            desc: "We acquire our inventory exclusively from verified retail partners, official brand drops, and a highly vetted network of premium suppliers."
          },
          {
            icon: Search,
            title: "2. Physical Inspection",
            desc: "Our experts examine material quality, stitching patterns, glue strokes, and build structure, comparing them against retail benchmarks."
          },
          {
            icon: Package,
            title: "3. Packaging & Tags",
            desc: "We verify box labeling, font weights, inner tissue paper, and manufacturer tags to ensure they match retail standards perfectly."
          },
        ].map((point, i) => (
          <div 
            key={i} 
            className="group p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <point.icon className="text-neutral-900 dark:text-white" size={20} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
              {point.title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {point.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden p-8 lg:p-12 rounded-[2rem] bg-neutral-950 text-white shadow-2xl border border-neutral-800">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-[#E63946] opacity-10 blur-[120px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-shrink-0 w-24 h-24 lg:w-32 lg:w-32 rounded-full border-2 border-[#E63946]/30 flex items-center justify-center p-2">
            <div className="w-full h-full rounded-full bg-[#E63946] flex items-center justify-center shadow-[0_0_30px_rgba(230,57,70,0.5)]">
              <ShieldCheck size={40} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-4">Our Sole Commitment</h2>
            <p className="text-neutral-400 leading-relaxed lg:text-lg">
              Every sneaker purchased from Sole Vault ships with our custom verification tag. 
              If a product fails any step of our process, it never makes it to our inventory. 
              <span className="text-white font-bold ml-1">Period.</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
