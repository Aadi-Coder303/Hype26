import { Suspense } from 'react';
import ConfirmationPage from './ConfirmationPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-neutral-400">Loading…</div></div>}>
      <ConfirmationPage />
    </Suspense>
  );
}
