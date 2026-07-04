import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  items: string[]; // array of product IDs
  _userId: string | null;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  syncFromServer: (userId: string) => Promise<void>;
  syncToServer: () => void;
  setUserId: (userId: string | null) => void;
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      _userId: null,

      setUserId: (userId) => set({ _userId: userId }),

      syncFromServer: async (userId: string) => {
        try {
          const res = await fetch(`/api/user/sync?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.wishlist) && data.wishlist.length > 0) {
              set({ items: data.wishlist, _userId: userId });
            } else {
              set({ _userId: userId });
              const local = get().items;
              if (local.length > 0) {
                get().syncToServer();
              }
            }
          }
        } catch { /* silent */ }
      },

      syncToServer: () => {
        if (syncTimeout) clearTimeout(syncTimeout);
        syncTimeout = setTimeout(() => {
          const { items, _userId } = get();
          if (!_userId) return;
          fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: _userId, wishlist: items }),
          }).catch(() => {});
        }, 500);
      },

      toggleItem: (productId) => {
        set((state) => {
          if (state.items.includes(productId)) {
            return { items: state.items.filter(id => id !== productId) };
          }
          return { items: [...state.items, productId] };
        });
        get().syncToServer();
      },

      hasItem: (productId) => get().items.includes(productId),
    }),
    {
      name: 'solevault-wishlist-storage',
    }
  )
);
