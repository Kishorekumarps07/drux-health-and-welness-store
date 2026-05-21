"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

/**
 * SessionManager — mounts once at the root layout level.
 * Initialises the Supabase auth listener and syncs the cart
 * after the user is confirmed as authenticated AND the session
 * has fully initialized (token applied to axios defaults).
 */
export const SessionManager = () => {
  const { initialize, isAuthenticated, initialized } = useAuthStore();
  const { fetchCart } = useCartStore();

  // One-time auth initialisation.
  // `initialize` is a stable Zustand reference — safe to include in deps.
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Fetch cart only after the full auth initialization cycle completes.
  // `initialized: true` guarantees the token is already in localStorage
  // and applied to the axios Authorization header before the request fires.
  useEffect(() => {
    if (isAuthenticated && initialized) {
      // Small tick delay ensures axios header is committed before the
      // cart request is dispatched (avoids a rare race on fast CPUs).
      const t = setTimeout(() => fetchCart(), 100);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, initialized, fetchCart]);

  return null;
};
