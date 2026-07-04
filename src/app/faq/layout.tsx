import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about authenticity, shipping, returns, and order tracking at Sole Vault.',
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
