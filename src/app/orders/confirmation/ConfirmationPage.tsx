'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function ConfirmationPage() {
  const params = useSearchParams();
  const txnid = params.get('txnid');
  const amount = params.get('amount');
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear the cart on successful order
    clearCart();
  }, [clearCart]);

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-neutral-50 px-4">
      <div className="bg-white max-w-lg w-full p-10 text-center shadow-sm border border-neutral-100">
        
        <div className="flex justify-center mb-6">
          <CheckCircle size={64} className="text-green-500" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Order Placed!</h1>
        <p className="text-neutral-500 mb-8 leading-relaxed">
          Thank you for your purchase. Your sneakers are being prepared and you'll receive a tracking update via email shortly.
        </p>

        {txnid && (
          <div className="bg-neutral-50 rounded-sm p-4 mb-8 text-left border border-neutral-200">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-500 font-medium">Transaction ID</span>
              <span className="font-bold font-mono">{txnid}</span>
            </div>
            {amount && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 font-medium">Amount Paid</span>
                <span className="font-bold">₹{parseFloat(amount).toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="flex-1 bg-black text-white py-3 font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors text-sm"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="flex-1 border border-black text-black py-3 font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
