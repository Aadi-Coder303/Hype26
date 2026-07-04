'use client';

import { useEffect, useState } from 'react';
import { OWNER_EMAILS } from '@/lib/constants';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function BuyerShell({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Auth checks will be re-implemented later with Shopify
    setIsAdmin(false);
  }, []);

  if (isAdmin) {
    // Owner: no announcement bar, no footer, no WhatsApp button
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementBar />
      {children}
    </>
  );
}
