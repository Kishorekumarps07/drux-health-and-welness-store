"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";
import { toast } from "sonner";

interface WishlistState {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (product) => {
        const items = get().items;
        const exists = items.some((item) => item.id === product.id);
        if (!exists) {
          set({ items: [...items, product] });
          toast.success(`${product.name} added to wishlist`);
        } else {
          toast.info(`${product.name} is already in your wishlist`);
        }
      },
      removeFromWishlist: (productId) => {
        const items = get().items;
        const itemToRemove = items.find((item) => item.id === productId);
        set({ items: items.filter((item) => item.id !== productId) });
        if (itemToRemove) {
          toast.success(`${itemToRemove.name} removed from wishlist`);
        }
      },
      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "druxx-wishlist",
    }
  )
);
