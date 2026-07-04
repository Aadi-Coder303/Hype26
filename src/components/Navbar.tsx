'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, Heart, ShoppingBag, Menu, User, LogOut, X, Package, LayoutDashboard, Moon, Sun, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OWNER_EMAILS } from '@/lib/constants';
import { useTheme } from '@/components/ThemeProvider';

interface Suggestion {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string | null;
}

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const cartItems = useCartStore(state => state.items);
  const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);
  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Suggestion state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Auth checks will be re-implemented later with Shopify
    setIsAdmin(false);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
      setActiveSuggestion(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  const handleLogout = async () => {
    // Auth logout will be handled via Shopify Customer API
    setIsAdmin(false);
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearch(false);
      setShowSuggestions(false);
      setSuggestions([]);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navigateToProduct = (id: string) => {
    setShowSearch(false);
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchQuery('');
    router.push(`/product/${id}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      navigateToProduct(suggestions[activeSuggestion].id);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setShowSearch(false);
    router.push(`/search?q=${encodeURIComponent(suggestion.name)}`);
  };

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString('en-IN')}`;

  // ── Suggestion dropdown component ──
  const SuggestionDropdown = () => {
    if (!showSuggestions || (suggestions.length === 0 && !loadingSuggestions)) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-xl rounded-lg overflow-hidden z-[100] max-h-[360px] overflow-y-auto">
        {loadingSuggestions ? (
          <div className="flex items-center justify-center py-6 gap-2 text-neutral-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs uppercase tracking-wider">Searching...</span>
          </div>
        ) : suggestions.length > 0 ? (
          <>
            {suggestions.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => handleSelectSuggestion(s)}
                onMouseEnter={() => setActiveSuggestion(idx)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  idx === activeSuggestion
                    ? 'bg-neutral-100 dark:bg-neutral-800'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-10 h-10 flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden">
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <ShoppingBag size={16} />
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate leading-tight">
                    {highlightMatch(s.name, searchQuery)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">{s.brand}</span>
                    <span className="text-[11px] text-neutral-300 dark:text-neutral-600">•</span>
                    <span className="text-[11px] font-bold text-[#E63946]">{formatPrice(s.price)}</span>
                  </div>
                </div>

                {/* Arrow hint */}
                <svg className="w-4 h-4 text-neutral-300 dark:text-neutral-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
            {/* View all results link */}
            <button
              onClick={handleSearchSubmit as unknown as () => void}
              className="w-full py-2.5 px-3 text-center text-xs font-bold uppercase tracking-wider text-[#E63946] hover:bg-[#E63946]/5 border-t border-neutral-100 dark:border-neutral-800 transition-colors"
            >
              View all results for &quot;{searchQuery}&quot;
            </button>
          </>
        ) : null}
      </div>
    );
  };

  // Highlight matching text in suggestion names
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="text-[#E63946] font-semibold">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  // ── Owner: minimal navbar ──
  if (isAdmin) {
    return (
      <header className="sticky top-0 z-50 w-full bg-neutral-950 text-white border-b border-neutral-800">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-black tracking-widest uppercase">
            SOLE VAULT <span className="text-[10px] font-bold tracking-wider text-neutral-500 ml-2">ADMIN</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
              <LayoutDashboard size={14} /> Dashboard
            </Link>
            <button onClick={handleLogout} className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#E63946] transition-colors flex items-center gap-1.5">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>
    );
  }

  // ── Buyer: full navbar ──
  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled
        ? 'bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 shadow-sm'
        : 'bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800'
    }`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden hover:text-[#E63946] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/" className="text-2xl font-bold tracking-widest uppercase" onClick={() => setMobileMenuOpen(false)}>
            SOLE VAULT
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex gap-8">
          <Link href="/products?category=men" className="text-sm uppercase tracking-[0.08em] font-medium text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:underline underline-offset-4 transition-all">Men</Link>
          <Link href="/products?category=women" className="text-sm uppercase tracking-[0.08em] font-medium text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:underline underline-offset-4 transition-all">Women</Link>
          <Link href="/products?category=kids" className="text-sm uppercase tracking-[0.08em] font-medium text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:underline underline-offset-4 transition-all">Kids</Link>
          <Link href="/products?category=sale" className="text-sm uppercase tracking-[0.08em] font-bold text-[#E63946] hover:text-black dark:hover:text-white hover:underline underline-offset-4 transition-all">Sale</Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Theme toggle — desktop only */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="hidden md:block hover:text-[#E63946] transition-colors mt-0.5"
          >
            {mounted && theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative" ref={searchContainerRef}>
            <button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setShowSuggestions(false);
                  setSuggestions([]);
                }
              }} 
              aria-label="Search" 
              className="hover:text-[#E63946] transition-colors mt-1"
            >
              <Search size={20} />
            </button>
            
            {showSearch && (
              <div className="absolute top-10 right-0 w-[85vw] sm:w-80 md:w-96 z-[100]">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-2.5 shadow-xl rounded-lg">
                  <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        autoFocus
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchKeyDown}
                        onFocus={() => {
                          if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        placeholder="Search for sneakers..." 
                        className="w-full border border-neutral-200 dark:border-neutral-600 p-2.5 pl-9 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#E63946]/30 focus:border-[#E63946] bg-white dark:bg-neutral-800 dark:text-white transition-all"
                        autoComplete="off"
                      />
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSuggestions([]);
                            setShowSuggestions(false);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-4 text-xs font-bold uppercase rounded-md hover:bg-[#E63946] dark:hover:bg-[#E63946] dark:hover:text-white transition-colors">
                      Go
                    </button>
                  </form>
                </div>
                <SuggestionDropdown />
              </div>
            )}
          </div>
          <Link href="/wishlist" aria-label="Wishlist" className="hover:text-[#E63946] transition-colors relative">
            <Heart size={20} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="hover:text-[#E63946] transition-colors relative">
            <ShoppingBag size={20} />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#E63946] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
          {/* Desktop auth */}
          <div className="hidden md:block">
            {mounted && !user && (
              <Link href="/login" className="text-sm font-bold uppercase tracking-wide hover:text-[#E63946]">
                Log In
              </Link>
            )}
            {mounted && user && (
              <div className="flex items-center gap-4">
                <Link href="/orders" className="hover:text-[#E63946] transition-colors" aria-label="My Orders">
                  <Package size={20} />
                </Link>
                <button onClick={handleSignOut} className="hover:text-[#E63946] transition-colors" aria-label="Sign Out">
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 animate-in slide-in-from-top duration-200">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            <Link href="/products?category=men" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all">Men</Link>
            <Link href="/products?category=women" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all">Women</Link>
            <Link href="/products?category=kids" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all">Kids</Link>
            <Link href="/products?category=sale" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-bold text-[#E63946] hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all">Sale</Link>
            <div className="border-t border-neutral-200 dark:border-neutral-800 mt-2 pt-2">
              <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all flex items-center gap-2">
                <Heart size={16} /> Wishlist
              </Link>
              <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} /> Bag
                </div>
                {mounted && cartCount > 0 && (
                  <span className="bg-[#E63946] text-white text-[10px] font-bold h-5 px-2 rounded-full flex items-center justify-center">
                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </span>
                )}
              </Link>
              {mounted && user && (
                <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all flex items-center gap-2">
                  <Package size={16} /> My Orders
                </Link>
              )}
            </div>
            {/* Theme & Auth — mobile only */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 mt-2 pt-2">
              <button
                onClick={() => { toggleTheme(); }}
                className="w-full py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all flex items-center gap-2"
              >
                {mounted && theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              {mounted && !user && (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all flex items-center gap-2">
                  <User size={16} /> Log In
                </Link>
              )}
              {mounted && user && (
                <button onClick={handleSignOut} className="w-full py-3 px-2 text-sm uppercase tracking-[0.08em] font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all flex items-center gap-2">
                  <LogOut size={16} /> Sign Out
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
