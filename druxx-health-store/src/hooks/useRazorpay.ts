"use client";

import { useCallback } from "react";

export const useRazorpay = () => {
  const loadRazorpay = useCallback(() => {
    return new Promise((resolve) => {
      // If Razorpay is already loaded, resolve immediately
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  return { loadRazorpay };
};
