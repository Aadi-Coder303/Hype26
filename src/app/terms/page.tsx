import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Sole Vault',
  description: 'Terms of Service and Conditions for Sole Vault',
};

export default function TermsOfServicePage() {
  return (
    <main className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E63946] mb-3">Legal</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Terms of Service</h1>
        <p className="text-neutral-500">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="lead text-lg mb-8 text-neutral-600 dark:text-neutral-400">
          Welcome to Sole Vault. By accessing our website and purchasing our products, you agree to be bound by the following Terms of Service.
        </p>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6">1. Authenticity Guarantee</h2>
        <p className="mb-8 text-neutral-700 dark:text-neutral-300">
          Sole Vault guarantees that every item sold on our platform is 100% authentic. All items go through a rigorous verification process before being shipped to you. If any item is found to be counterfeit by a certified professional, we offer a full refund.
        </p>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6">2. Order Acceptance and Pricing</h2>
        <p className="mb-8 text-neutral-700 dark:text-neutral-300">
          All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Pricing is subject to change without notice. In the event of a pricing error on the website, we reserve the right to cancel any orders placed at the incorrect price.
        </p>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6">3. Payment & Security</h2>
        <p className="mb-8 text-neutral-700 dark:text-neutral-300">
          We use secure, encrypted payment gateways. We do not store your credit card information on our servers. By placing an order, you warrant that you are authorized to use the designated payment method.
        </p>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6">4. Shipping & Returns</h2>
        <p className="mb-8 text-neutral-700 dark:text-neutral-300">
          Shipping timelines and costs vary based on your location. For detailed information, please review our <Link href="/shipping" className="text-blue-600 dark:text-blue-400 hover:underline">Shipping & Returns policy</Link>. Returns are generally accepted within 7 days of delivery, provided the item is unworn, in its original packaging, and with all authenticity tags attached.
        </p>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6">5. Limitation of Liability</h2>
        <p className="mb-8 text-neutral-700 dark:text-neutral-300">
          To the maximum extent permitted by applicable law, Sole Vault shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services or products.
        </p>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6">6. Changes to Terms</h2>
        <p className="mb-8 text-neutral-700 dark:text-neutral-300">
          We reserve the right to update or modify these Terms of Service at any time without prior notice. Your continued use of the website following any changes constitutes your acceptance of the revised terms.
        </p>
      </div>
      
      <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
        <Link href="/" className="text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </main>
  );
}
