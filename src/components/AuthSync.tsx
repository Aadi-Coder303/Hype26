'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

export default function AuthSync() {
  const supabase = createClient();
  const cartSync = useCartStore(s => s.syncFromServer);
  const wishlistSync = useWishlistStore(s => s.syncFromServer);
  const setCartUserId = useCartStore(s => s.setUserId);
  const setWishlistUserId = useWishlistStore(s => s.setUserId);

  useEffect(() => {
    // Sync on initial load if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setCartUserId(session.user.id);
        setWishlistUserId(session.user.id);
        cartSync(session.user.id);
        wishlistSync(session.user.id);
      }
    });

    // Sync on auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) {
        setCartUserId(session.user.id);
        setWishlistUserId(session.user.id);
        cartSync(session.user.id);
        wishlistSync(session.user.id);
      } else {
        setCartUserId(null);
        setWishlistUserId(null);
      }

      if (event === 'SIGNED_OUT') {
        // Don't clear cart on logout — preserve items in localStorage
        // so the buyer doesn't lose their bag mid-checkout
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, cartSync, wishlistSync, setCartUserId, setWishlistUserId]);

  return null; // invisible component
}
