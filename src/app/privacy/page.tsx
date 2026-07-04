'use client';

import Link from 'next/link';
import SecureEmail from '@/components/SecureEmail';

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E63946] mb-3">Legal</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-neutral-500">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">
        <p className="lead text-lg mb-8 text-neutral-600 dark:text-neutral-400">
          At Sole Vault, we are committed to protecting your privacy and ensuring that your personal data is handled securely and in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) of India.
        </p>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6 text-black dark:text-white">1. Information We Collect</h2>
        <p className="mb-4">
          To provide you with our premium sneaker resale services, we collect the following personal information when you interact with our platform:
        </p>
        <ul className="list-disc pl-6 mb-8 space-y-2">
          <li><strong>Identity Data:</strong> Full name.</li>
          <li><strong>Contact Data:</strong> Email address and phone number.</li>
          <li><strong>Logistical Data:</strong> Shipping and billing addresses.</li>
          <li><strong>Financial Data:</strong> Payment information (processed securely via our payment gateway).</li>
          <li><strong>Transaction Data:</strong> Order history and cart activity.</li>
        </ul>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6 text-black dark:text-white">2. Why We Collect It</h2>
        <p className="mb-8">
          We process your personal data strictly for the following purposes:
        </p>
        <ul className="list-disc pl-6 mb-8 space-y-2">
          <li><strong>Order Fulfillment:</strong> To process payments, verify sneaker authenticity, and deliver your orders accurately.</li>
          <li><strong>Customer Support:</strong> To communicate with you regarding your order status, returns, and general inquiries.</li>
          <li><strong>Marketing Communications:</strong> To send you promotional emails about exclusive drops and sales, subject to your explicit, revokable consent.</li>
        </ul>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6 text-black dark:text-white">3. Third-Party Processors</h2>
        <p className="mb-4">
          We do not sell your personal data. To operate our marketplace, we share necessary data with trusted third-party service providers (Data Fiduciaries/Processors):
        </p>
        <ul className="list-disc pl-6 mb-8 space-y-2">
          <li><strong>Shopify:</strong> Used as our backend data layer and inventory management system.</li>
          <li><strong>PayU:</strong> Our secure payment gateway for processing transactions.</li>
          <li><strong>WhatsApp:</strong> Used for direct, secure customer support communications.</li>
        </ul>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6 text-black dark:text-white">4. Cookie Usage</h2>
        <p className="mb-8">
          Our website uses strictly necessary cookies to maintain your session (e.g., keeping items in your cart) and functional cookies to remember your preferences (like Dark Mode settings). We also use analytics cookies to understand how visitors interact with our storefront, helping us optimize the user experience. You can manage your cookie preferences through your browser settings.
        </p>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6 text-black dark:text-white">5. Data Retention Period</h2>
        <p className="mb-8">
          We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected. Order history and transaction data are kept for a minimum of 7 years to comply with Indian tax and accounting laws. Marketing data is retained until you withdraw your consent or unsubscribe.
        </p>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6 text-black dark:text-white">6. Your Rights (DPDPA 2023)</h2>
        <p className="mb-4">
          Under the Digital Personal Data Protection Act, 2023, you have the following rights regarding your personal data:
        </p>
        <ul className="list-disc pl-6 mb-8 space-y-2">
          <li><strong>Right to Access:</strong> Request a summary of the personal data we hold about you.</li>
          <li><strong>Right to Correction:</strong> Request updates or corrections to inaccurate personal data.</li>
          <li><strong>Right to Deletion:</strong> Request the erasure of your personal data when it is no longer necessary for the purposes collected.</li>
          <li><strong>Right of Grievance Redressal:</strong> The right to easily register a complaint regarding your data.</li>
        </ul>

        <h2 className="text-2xl font-bold uppercase tracking-wide mt-12 mb-6 text-black dark:text-white">7. Contact Us</h2>
        <p className="mb-8">
          To exercise any of your data rights, request data deletion, or contact our Data Protection Officer, please reach out to us at: <br />
          <SecureEmail user="support" domain="solevault" tld="com" className="text-blue-600 dark:text-blue-400 hover:underline font-medium mt-2" />
        </p>
      </div>
      
      <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
        <Link href="/" className="text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors btn-press">
          &larr; Back to Home
        </Link>
        <Link href="/terms" className="text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors btn-press">
          Terms of Service &rarr;
        </Link>
      </div>
    </main>
  );
}
