'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { OWNER_EMAILS } from '@/lib/constants';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function BuyerShell({ children }: { children: React.ReactNode }) {
  const [isOwner, setIsOwner] = useState(false);
  const [checked, setChecked] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email && OWNER_EMAILS.includes(session.user.email)) {
        setIsOwner(true);
      }
      setChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
