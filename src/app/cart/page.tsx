'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/formatCurrency';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [emptyText, setEmptyText] = useState("");

  useEffect(() => {
    setMounted(true);
    const quotes = [
      "Your bag is empty. Your feet are crying.",
      "Wow, such empty. Go buy some sneakers.",
      "0 items? We know you have better taste than that.",
      "Your cart is as empty as my ex's heart.",
      "Nothing here. Are you even trying to look fly?",
      "Your bag is so empty we can hear an echo. Your feet deserve better than this—go secure some heat."
    ];
    setEmptyText(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl min-h-[60vh]">
      <h1 className="text-3xl font-bold uppercase tracking-wide mb-8">Your Bag</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-6 font-medium">{emptyText}</p>
          <Link href="/products" className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-bold uppercase tracking-wider hover:bg-[#E63946] dark:hover:bg-[#E63946] dark:hover:text-white transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-12">
          {/* Cart Items */}
          <div className="md:w-2/3 flex flex-col gap-6">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                {/* Clickable product image */}
                <Link href={`/products/${item.productId}`} className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 overflow-hidden rounded-sm ring-1 ring-transparent hover:ring-neutral-300 dark:hover:ring-neutral-600 transition-all">
                  {item.imageUrl && <img src={item.imageUrl.split(',')[0].trim()} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Clickable product name */}
                    <Link href={`/products/${item.productId}`} className="font-bold hover:text-neutral-500 transition-colors hover:underline underline-offset-2">{item.name}</Link>
                    <p className="text-sm text-neutral-500">Size: {item.size}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold">{formatCurrency(item.price)}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex border border-neutral-200 dark:border-neutral-700">
                        <button 
                          className="px-3 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >-</button>
                        <span className="px-3 py-1 border-x border-neutral-200 dark:border-neutral-700">{item.quantity}</span>
                        <button 
                          className="px-3 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >+</button>
                      </div>
                      <button 
                        className="text-sm underline text-neutral-500 hover:text-black dark:hover:text-white"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="md:w-1/3">
            <div className="bg-neutral-50 dark:bg-neutral-900 p-6">
              <h2 className="text-lg font-bold uppercase tracking-wide mb-6">Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Shipping</span>
                  <span className="font-semibold">Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mb-6 flex justify-between items-center">
                <span className="font-bold uppercase tracking-wide">Total</span>
                <span className="text-xl font-bold">{formatCurrency(getTotalPrice())}</span>
              </div>
              <Link href="/checkout" className="block text-center w-full bg-[#E63946] text-white py-4 font-bold uppercase tracking-wider hover:bg-black transition-colors">
                Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
