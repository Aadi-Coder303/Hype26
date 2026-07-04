'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setEmail('');
        setTimeout(() => setSuccess(false), 5000);
      } else {
        alert(data.error || 'Failed to subscribe');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-neutral-950 text-white py-16 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Link href="/" className="text-xl font-black tracking-widest uppercase block mb-4 hover:text-[#E63946] transition-colors">
            SOLE VAULT
          </Link>
          <p className="text-sm text-neutral-400 max-w-xs leading-relaxed">
            100% authentic sneakers sourced from official drops. Elevate your collection with verified pairs.
          </p>
          <div className="flex gap-4 mt-5">
            <a href="#" className="text-neutral-500 hover:text-white transition-colors duration-200" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" className="text-neutral-500 hover:text-white transition-colors duration-200" aria-label="X / Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold uppercase tracking-wide mb-5 text-sm">Shop</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li><Link href="/products?category=men" className="hover:text-white transition-colors duration-200 link-underline">Men</Link></li>
            <li><Link href="/products?category=women" className="hover:text-white transition-colors duration-200 link-underline">Women</Link></li>
            <li><Link href="/products?category=kids" className="hover:text-white transition-colors duration-200 link-underline">Kids</Link></li>
            <li><Link href="/products?category=sale" className="hover:text-[#E63946] transition-colors duration-200 font-semibold">Sale</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold uppercase tracking-wide mb-5 text-sm">Support</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li><Link href="/orders" className="hover:text-white transition-colors duration-200 link-underline">My Orders</Link></li>
            <li><Link href="/faq" className="hover:text-white transition-colors duration-200 link-underline">FAQ</Link></li>
            <li><Link href="/shipping" className="hover:text-white transition-colors duration-200 link-underline">Shipping & Returns</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors duration-200 link-underline">Contact Us</Link></li>
            <li><Link href="/authenticity" className="hover:text-white transition-colors duration-200 link-underline">Authenticity Guarantee</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold uppercase tracking-wide mb-5 text-sm">Stay Updated</h4>
          <p className="text-sm text-neutral-400 mb-4">Get early access to exclusive drops.</p>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
            <div className="flex">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address" 
                required
                className="bg-white/5 border border-white/10 px-4 py-2.5 w-full text-sm focus:outline-none focus:border-[#E63946] text-white placeholder:text-neutral-500 transition-colors" 
              />
              <button 
                type="submit"
                disabled={loading || success}
                className="bg-[#E63946] text-white px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-200 btn-press shrink-0 disabled:opacity-50"
              >
                {loading ? '...' : success ? '✓' : 'Join'}
              </button>
            </div>
            {success && <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest animate-fade-in">Thanks for subscribing!</p>}
          </form>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} Sole Vault. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs text-neutral-500">
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
