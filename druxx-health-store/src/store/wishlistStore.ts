"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";
import { toast } from "sonner";
import { useAuthStore } from "./authStore";

interface WishlistState {
  items: Product[];
  wishlists: { [userId: string]: Product[] };
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncUserWishlist: (userId: string | null) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlists: {},
      addToWishlist: async (product) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        const wishlists = get().wishlists || {};
        const userWishlist = wishlists[userId] || [];
        const exists = userWishlist.some((item) => item.id === product.id);

        if (!exists) {
          const updatedList = [...userWishlist, product];
          set({
            wishlists: {
              ...wishlists,
              [userId]: updatedList,
            },
            items: updatedList,
          });
          toast.success(`${product.name} added to wishlist`);

          try {
            const { wishlistService } = await import("@/services/wishlistService");
            const syncedItems = await wishlistService.addToWishlist(product.id);
            set({
              wishlists: {
                ...wishlists,
                [userId]: syncedItems,
              },
              items: syncedItems,
            });
          } catch (error) {
            console.error("Failed to add to backend wishlist:", error);
          }
        } else {
          toast.info(`${product.name} is already in your wishlist`);
        }
      },
      removeFromWishlist: async (productId) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        const wishlists = get().wishlists || {};
        const userWishlist = wishlists[userId] || [];
        const itemToRemove = userWishlist.find((item) => item.id === productId);

        if (itemToRemove) {
          const updatedList = userWishlist.filter((item) => item.id !== productId);
          set({
            wishlists: {
              ...wishlists,
              [userId]: updatedList,
            },
            items: updatedList,
          });
          toast.success(`${itemToRemove.name} removed from wishlist`);

          try {
            const { wishlistService } = await import("@/services/wishlistService");
            const syncedItems = await wishlistService.removeFromWishlist(productId);
            set({
              wishlists: {
                ...wishlists,
                [userId]: syncedItems,
              },
              items: syncedItems,
            });
          } catch (error) {
            console.error("Failed to remove from backend wishlist:", error);
          }
        }
      },
      isInWishlist: (productId) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return false;
        const wishlists = get().wishlists || {};
        const userWishlist = wishlists[userId] || [];
        return userWishlist.some((item) => item.id === productId);
      },
      clearWishlist: () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        const wishlists = get().wishlists || {};
        set({
          wishlists: {
            ...wishlists,
            [userId]: [],
          },
          items: [],
        });
      },
      syncUserWishlist: async (userId) => {
        if (!userId) {
          set({ items: [] });
          return;
        }

        try {
          const wishlists = get().wishlists || {};
          const localItems = wishlists[userId] || [];
          const localProductIds = localItems.map(item => item.id);

          const { wishlistService } = await import("@/services/wishlistService");
          const syncedItems = await wishlistService.syncWishlist(localProductIds);
          set({
            wishlists: {
              ...wishlists,
              [userId]: syncedItems,
            },
            items: syncedItems,
          });
        } catch (error) {
          console.error("Wishlist sync failed:", error);
          // Fallback to local items on failure
          const wishlists = get().wishlists || {};
          const userWishlist = wishlists[userId] || [];
          set({ items: userWishlist });
        }
      },
    }),
    {
      name: "druxx-wishlist",
    }
  )
);

// Subscribe to auth state changes to synchronize active items
if (typeof window !== "undefined") {
  // Sync on initial load
  const initialUserId = useAuthStore.getState().user?.id || null;
  useWishlistStore.getState().syncUserWishlist(initialUserId);

  useAuthStore.subscribe((state) => {
    const userId = state.user?.id || null;
    useWishlistStore.getState().syncUserWishlist(userId);
  });
}
