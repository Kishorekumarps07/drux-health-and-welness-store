import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";
import { toast } from "sonner";
import { cartService } from "@/services/cartService";
import { useAuthStore } from "@/store/authStore";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string;
  couponDiscount: number;
  isSyncing: boolean;

  // Actions
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  syncWithServer: () => Promise<void>;
  
  // Computed
  totalItems: () => number;
  subtotal: () => number;
  shipping: () => number;
  tax: () => number;
  total: () => number;
  fetchCart: () => Promise<void>;
}

const VALID_COUPONS: Record<string, number> = {
  DRUXX10: 10,
  HEALTH20: 20,
  FIRST15: 15,
  ORGANIC25: 25,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: "",
      couponDiscount: 0,
      isSyncing: false,

      addItem: async (product, quantity = 1) => {
        const { isAuthenticated } = useAuthStore.getState();
        const previousItems = [...get().items];
        
        // Optimistic UI update
        let updatedItems = [...previousItems];
        const existing = updatedItems.find((i) => i.product.id === product.id);
        
        if (existing) {
          updatedItems = updatedItems.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: Math.min(i.quantity + quantity, 10) }
              : i
          );
        } else {
          updatedItems.push({ product, quantity });
        }
        
        set({ items: updatedItems });
        toast.success(`${product.name} added to cart`);

        // Server Sync
        if (isAuthenticated) {
          try {
            const serverItems = await cartService.addItem(product.id, quantity);
            set({ items: serverItems });
          } catch (error) {
            console.error("Cart sync failed:", error);
          }
        }
      },

      removeItem: async (productId) => {
        const { isAuthenticated } = useAuthStore.getState();
        const itemToRemove = get().items.find(i => i.product.id === productId);
        
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
        toast.error("Item removed from cart");

        if (isAuthenticated && itemToRemove?.id) {
          try {
            const serverItems = await cartService.removeItem(itemToRemove.id);
            set({ items: serverItems });
          } catch (error) {
            console.error("Cart remove sync failed:", error);
          }
        }
      },

      updateQuantity: async (productId, quantity) => {
        const { isAuthenticated } = useAuthStore.getState();
        
        if (quantity <= 0) {
          await get().removeItem(productId);
          return;
        }

        const itemToUpdate = get().items.find(i => i.product.id === productId);

        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity: Math.min(quantity, 10) } : i
          ),
        }));

        if (isAuthenticated && itemToUpdate?.id) {
          try {
            const serverItems = await cartService.updateItem(itemToUpdate.id, quantity);
            set({ items: serverItems });
          } catch (error) {
            console.error("Cart update sync failed:", error);
          }
        }
      },

      clearCart: () => {
        const { isAuthenticated } = useAuthStore.getState();
        set({ items: [], couponCode: "", couponDiscount: 0 });
        if (isAuthenticated) {
          cartService.clearCart();
        }
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      applyCoupon: (code) => {
        const discount = VALID_COUPONS[code.toUpperCase()];
        if (discount) {
          set({ couponCode: code.toUpperCase(), couponDiscount: discount });
          toast.success(`Coupon ${code.toUpperCase()} applied!`);
          return true;
        }
        toast.error("Invalid coupon code");
        return false;
      },

      removeCoupon: () => set({ couponCode: "", couponDiscount: 0 }),

      syncWithServer: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated || get().isSyncing) return;

        set({ isSyncing: true });
        try {
          const localItems = get().items.map(i => ({ 
            productId: i.product.id, 
            quantity: i.quantity 
          }));
          const mergedItems = await cartService.syncCart(localItems);
          set({ items: mergedItems });
        } catch (error) {
          console.error("Cart final sync failed:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),

      shipping: () => {
        const sub = get().subtotal();
        return sub > 499 ? 0 : 49;
      },

      tax: () => Math.round(get().subtotal() * 0.05),

      total: () => {
        const sub = get().subtotal();
        const discount = (sub * get().couponDiscount) / 100;
        return Math.round(sub - discount + get().shipping() + get().tax());
      },

      fetchCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;
        
        try {
          const serverItems = await cartService.getCart();
          set({ items: serverItems });
        } catch (error) {
          console.error("Fetch cart failed:", error);
        }
      },
    }),
    {
      name: "druxx-cart",
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
      }),
    }
  )
);
