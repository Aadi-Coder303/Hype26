'use client';

import { useEffect, useState } from 'react';
import { OWNER_EMAILS } from '@/lib/constants';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function BuyerShell({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
      setIsOwner(!!(session?.user?.email && OWNER_EMAILS.includes(session.user.email)));
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (isOwner) {
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
