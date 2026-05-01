"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export const SessionManager = () => {
  const { initialize, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    const initSession = async () => {
      await initialize();
    };
    initSession();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      // In a real app, this would fetch from the database
      // fetchCart(); 
    }
  }, [isAuthenticated, fetchCart]);

  return null; // This component doesn't render anything
};
