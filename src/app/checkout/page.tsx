import { Suspense } from 'react';
import CheckoutPage from './CheckoutPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-neutral-400">Loading checkout…</div></div>}>
      <CheckoutPage />
    </Suspense>
  );
}
