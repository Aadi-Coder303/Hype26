import { Package, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

export default function ShippingPage() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-4xl min-h-[60vh]">
      <div className="text-center mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E63946] mb-3">Policies</p>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
          Shipping & Returns
        </h1>
      </div>

      {/* Quick highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
        {[
          { icon: Truck, label: 'Free Shipping', sub: 'All India' },
          { icon: Package, label: 'Double-Boxed', sub: 'Pristine delivery' },
          { icon: ShieldCheck, label: 'Verified', sub: 'Before dispatch' },
          { icon: RotateCcw, label: '7-Day Claims', sub: 'For defects' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center text-center p-4 border border-neutral-200 hover:border-[#E63946]/30 hover:bg-[#E63946]/5 transition-all duration-200">
            <Icon size={22} strokeWidth={1.5} className="text-[#E63946] mb-2" />
            <p className="font-bold text-xs uppercase tracking-wide">{label}</p>
            <p className="text-[10px] text-neutral-500 uppercase mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="space-y-12 text-neutral-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-4 uppercase tracking-wide text-black flex items-center gap-2">
            <Truck size={20} className="text-[#E63946]" /> Shipping Policy
          </h2>
          <p className="mb-4">
            We offer fast and reliable shipping across India. All our packages are double-boxed to ensure the shoebox arrives in pristine condition.
          </p>
          <ul className="space-y-3">
            {[
              { label: 'Standard Shipping', detail: '3–5 business days (Free on all orders)' },
              { label: 'Express Shipping', detail: '1–2 business days (Calculated at checkout)' },
              { label: 'Order Processing', detail: '1–2 business days for verification and packaging' },
            ].map((item) => (
              <li key={item.label} className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-100">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] mt-2 shrink-0" />
                <div>
                  <strong className="text-black">{item.label}:</strong> {item.detail}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 uppercase tracking-wide text-black flex items-center gap-2">
            <RotateCcw size={20} className="text-[#E63946]" /> Return Policy
          </h2>
          <p className="mb-4">
            Sole Vault operates as a curated marketplace for highly sought-after, limited-edition sneakers. Because of market volatility and the exclusivity of our inventory, <strong className="text-black">all sales are considered final</strong>.
          </p>
          <p className="mb-4">
            We do not accept returns, exchanges, or issue refunds for issues regarding sizing. Please ensure you know your correct size before purchasing.
          </p>
          <div className="p-4 bg-[#E63946]/5 border border-[#E63946]/20 text-sm">
            <strong className="text-black">Exceptions:</strong> If you receive the incorrect item, or if the item is found to be inauthentic (which our verification process guarantees against), please contact support within 48 hours of delivery to initiate a claim.
          </div>
        </section>
      </div>
    </main>
  );
}
