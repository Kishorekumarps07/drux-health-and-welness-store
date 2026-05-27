import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";
import { toast } from "sonner";
import { cartService } from "@/services/cartService";
import { useAuthStore } from "@/store/authStore";
import type { Coupon } from "@/services/couponService";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string;
  couponDiscount: number;
  couponDetails: Coupon | null;
  isSyncing: boolean;

  // Actions
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  syncWithServer: () => Promise<void>;
  
  // Computed
  totalItems: () => number;
  subtotal: () => number;
  shipping: () => number;
  tax: () => number;
  couponDiscountAmount: () => number;
  total: () => number;
  fetchCart: () => Promise<void>;
}

const isCouponApplicable = (coupon: Coupon | null, items: CartItem[]): boolean => {
  if (!coupon) return true;
  if (!coupon.productId && !coupon.vendorId) return true;
  
  if (coupon.productId) {
    return items.some((item) => item.product.id === coupon.productId);
  }
  if (coupon.vendorId) {
    return items.some((item) => item.product.vendor?.id === coupon.vendorId);
  }
  
  return true;
};

const setItemsAndValidateCoupon = (
  set: any,
  get: any,
  updatedItems: CartItem[]
) => {
  const coupon = get().couponDetails;
  if (coupon && !isCouponApplicable(coupon, updatedItems)) {
    set({
      items: updatedItems,
      couponCode: "",
      couponDiscount: 0,
      couponDetails: null,
    });
    toast.info("Coupon removed as target items are no longer in your cart.");
  } else {
    set({ items: updatedItems });
  }
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: "",
      couponDiscount: 0,
      couponDetails: null,
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
        
        setItemsAndValidateCoupon(set, get, updatedItems);
        toast.success(`${product.name} added to cart`);

        // Server Sync
        if (isAuthenticated) {
          try {
            const serverItems = await cartService.addItem(product.id, quantity);
            setItemsAndValidateCoupon(set, get, serverItems);
          } catch (error) {
            console.error("Cart sync failed:", error);
          }
        }
      },

      removeItem: async (productId) => {
        const { isAuthenticated } = useAuthStore.getState();
        const itemToRemove = get().items.find(i => i.product.id === productId);
        
        const updatedItems = get().items.filter((i) => i.product.id !== productId);
        setItemsAndValidateCoupon(set, get, updatedItems);
        toast.error("Item removed from cart");

        if (isAuthenticated && itemToRemove?.id) {
          try {
            const serverItems = await cartService.removeItem(itemToRemove.id);
            setItemsAndValidateCoupon(set, get, serverItems);
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

        const updatedItems = get().items.map((i) =>
          i.product.id === productId ? { ...i, quantity: Math.min(quantity, 10) } : i
        );
        setItemsAndValidateCoupon(set, get, updatedItems);

        if (isAuthenticated && itemToUpdate?.id) {
          try {
            const serverItems = await cartService.updateItem(itemToUpdate.id, quantity);
            setItemsAndValidateCoupon(set, get, serverItems);
          } catch (error) {
            console.error("Cart update sync failed:", error);
          }
        }
      },

      clearCart: () => {
        const { isAuthenticated } = useAuthStore.getState();
        set({ items: [], couponCode: "", couponDiscount: 0, couponDetails: null });
        if (isAuthenticated) {
          cartService.clearCart();
        }
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      applyCoupon: async (code) => {
        try {
          const { couponService } = await import("@/services/couponService");
          const coupon = await couponService.validateCoupon(code);
          if (coupon) {
            const { items } = get();
            if (!isCouponApplicable(coupon, items)) {
              let targetName = "the required products";
              if (coupon.product?.title) {
                targetName = `"${coupon.product.title}"`;
              } else if (coupon.vendor?.storeName) {
                targetName = `products from "${coupon.vendor.storeName}"`;
              }
              toast.error(`This coupon is only applicable to ${targetName}.`);
              return false;
            }

            set({ 
              couponCode: coupon.code.toUpperCase(), 
              couponDiscount: coupon.discountPercent,
              couponDetails: coupon
            });
            return true;
          }
          toast.error("Invalid coupon code");
          return false;
        } catch (error: any) {
          toast.error(error.response?.data?.message || error.message || "Failed to apply coupon");
          return false;
        }
      },

      removeCoupon: () => set({ couponCode: "", couponDiscount: 0, couponDetails: null }),

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
          setItemsAndValidateCoupon(set, get, mergedItems);
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

      couponDiscountAmount: () => {
        const coupon = get().couponDetails;
        if (!coupon) return 0;

        const { items } = get();
        let matchingItems = items;

        if (coupon.productId) {
          matchingItems = items.filter((item) => item.product.id === coupon.productId);
        } else if (coupon.vendorId) {
          matchingItems = items.filter((item) => item.product.vendor?.id === coupon.vendorId);
        }

        const applicableSubtotal = matchingItems.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0
        );

        return Math.round((applicableSubtotal * coupon.discountPercent) / 100);
      },

      total: () => {
        const sub = get().subtotal();
        const discount = get().couponDiscountAmount();
        return Math.round(sub - discount + get().shipping() + get().tax());
      },

      fetchCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;
        
        try {
          const serverItems = await cartService.getCart();
          setItemsAndValidateCoupon(set, get, serverItems);
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
        couponDetails: state.couponDetails,
      }),
    }
  )
);
