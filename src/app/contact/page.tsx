'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Send, Clock, Loader2 } from 'lucide-react';
import SecureEmail from '@/components/SecureEmail';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Message sent! We will get back to you soon.');
        (e.target as HTMLFormElement).reset();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to send message.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-16 max-w-4xl min-h-[60vh]">
      <div className="text-center mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E63946] mb-3">Get in Touch</p>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
          Contact Us
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <p className="text-neutral-600 mb-8 leading-relaxed">
            Have a question about an order, our authentication process, or looking for a specific pair? Fill out the form and our team will get back to you within 24 hours.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-neutral-600 p-4 bg-neutral-50 border border-neutral-100 hover:border-neutral-200 transition-colors">
              <Clock size={18} className="text-[#E63946] shrink-0" />
              <div>
                <p className="font-bold text-sm text-black">Hours</p>
                <p className="text-sm">Mon – Sat, 10:00 AM – 6:00 PM IST</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-neutral-600 p-4 bg-neutral-50 border border-neutral-100 hover:border-neutral-200 transition-colors">
              <Send size={18} className="text-[#E63946] shrink-0" />
              <div>
                <p className="font-bold text-sm text-black">Email Support</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <SecureEmail user="support" domain="solevault" tld="com" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <form className="space-y-4 relative" onSubmit={handleSubmit}>
            {/* Honeypot field (hidden from users, filled by bots) */}
            <div className="absolute opacity-0 -z-10" aria-hidden="true">
              <label htmlFor="a_password">Leave this field blank</label>
              <input type="text" name="a_password" id="a_password" tabIndex={-1} autoComplete="off" />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">Name</label>
              <input type="text" name="name" required className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-[#E63946] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">Email</label>
              <input type="email" name="email" required className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-[#E63946] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">Order Number (Optional)</label>
              <input type="text" name="orderNumber" className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-[#E63946] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">Message</label>
              <textarea name="message" rows={5} required className="w-full border border-neutral-300 p-3 focus:outline-none focus:border-[#E63946] transition-colors resize-none"></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white font-bold uppercase tracking-wider py-4 hover:bg-[#E63946] transition-all duration-200 flex items-center justify-center gap-2 btn-press disabled:opacity-70"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
