'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/app/actions/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await registerUser(null, formData);
      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/');
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white dark:bg-neutral-950 px-4 my-12">
      <div className="w-full max-w-md p-8 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-black dark:text-white mb-2">Create Account</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Join Hype26 for exclusive drops</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">First Name</label>
              <input 
                type="text" 
                name="firstName"
                required 
                className="w-full p-4 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white"
                placeholder="John"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                required 
                className="w-full p-4 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">Email</label>
            <input 
              type="email" 
              name="email"
              required 
              className="w-full p-4 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              required 
              className="w-full p-4 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="mt-4 w-full bg-[#E63946] hover:bg-[#d62828] text-white font-bold uppercase tracking-widest py-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Already have an account?{' '}
          <Link href="/login" className="text-black dark:text-white font-bold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
