'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Are all sneakers authentic?',
    answer: 'Yes, every single pair on Sole Vault goes through a rigorous multi-point authenticity verification process. We source directly from official drops and trusted retail partners. We do not sell fakes, B-grades, or factory variants.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Orders are typically processed within 1-2 business days. Standard shipping within India takes 3-5 business days. Express shipping options are available at checkout.',
  },
  {
    question: 'Do you accept returns?',
    answer: 'Due to the limited nature of our products, all sales are final. However, if there is a verified defect or fulfillment error on our part, we will offer a replacement or refund within 7 days of delivery.',
  },
  {
    question: 'How can I track my order?',
    answer: 'Once your order ships, you will receive a tracking number via email and SMS. You can also track your order status by logging into your account dashboard.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="container mx-auto px-4 py-16 max-w-3xl min-h-[60vh]">
      <div className="text-center mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E63946] mb-3">Help Center</p>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="flex flex-col gap-2">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="border border-neutral-200 hover:border-neutral-300 transition-colors"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-5 text-left group"
            >
              <span className="font-bold text-sm sm:text-base uppercase tracking-wide group-hover:text-[#E63946] transition-colors duration-200">
                {faq.question}
              </span>
              <ChevronDown
                size={18}
                className={`shrink-0 ml-4 text-neutral-400 transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-[#E63946]' : ''}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-out-expo ${
                openIndex === idx ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="px-5 pb-5 text-neutral-600 leading-relaxed text-sm">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
