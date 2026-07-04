'use client';

import { useState } from 'react';
import { Eye, Mail } from 'lucide-react';

interface SecureEmailProps {
  user: string;
  domain: string;
  tld: string;
  className?: string;
}

export default function SecureEmail({ user, domain, tld, className = "" }: SecureEmailProps) {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <button 
        onClick={() => setRevealed(true)}
        className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors ${className}`}
      >
        <Eye size={12} /> Reveal Email
      </button>
    );
  }

  const email = `${user}@${domain}.${tld}`;

  return (
    <a 
      href={`mailto:${email}`} 
      className={`inline-flex items-center gap-1.5 hover:text-[#E63946] transition-colors ${className}`}
    >
      <Mail size={12} className="shrink-0" />
      {email}
    </a>
  );
}
