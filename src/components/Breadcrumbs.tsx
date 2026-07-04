'use client';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex mb-8 overflow-x-auto no-scrollbar py-1" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-[10px] sm:text-xs font-medium uppercase tracking-widest text-neutral-500">
        <li className="flex items-center">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5">
            <Home size={12} />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ChevronRight size={10} className="text-neutral-300 dark:text-neutral-700 shrink-0" />
            {item.href ? (
              <Link href={item.href} className="hover:text-black dark:hover:text-white transition-colors whitespace-nowrap">
                {item.label}
              </Link>
            ) : (
              <span className="text-neutral-900 dark:text-white font-bold whitespace-nowrap">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
