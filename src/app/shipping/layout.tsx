import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Returns',
  description: 'Information about our shipping times, delivery partners, and return policy for authentic sneakers.',
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
