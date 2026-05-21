"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * Custom hook to redirect already-logged-in users visiting auth pages.
 * Enforces correct dashboard routing based on user's active role.
 * 
 * @param requiredRole The role required for the current login portal (e.g. CUSTOMER, VENDOR, ADMIN)
 */
export function useAuthRedirect(requiredRole?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, initialized, loading } = useAuthStore();

  useEffect(() => {
    if (!initialized || loading) return;

    if (isAuthenticated && user) {
      const activeRole = user.activeRole || "CUSTOMER";
      const redirectUrl = searchParams.get("redirect") || "";

      // If the user's role doesn't match the required portal role, let the page component
      // show the role mismatch screen instead of auto-redirecting (which causes loops).
      if (requiredRole && activeRole !== requiredRole && !user.isAdmin) {
        return;
      }

      // If already logged in to the correct role/portal, redirect to their home base
      if (activeRole === "ADMIN") {
        router.replace("/dashboard/admin");
      } else if (activeRole === "VENDOR") {
        router.replace("/dashboard/vendor");
      } else {
        // Customer
        if (redirectUrl) {
          router.replace(decodeURIComponent(redirectUrl));
        } else {
          router.replace("/");
        }
      }
    }
  }, [isAuthenticated, user, initialized, loading, router, searchParams, requiredRole]);

  return { initialized, loading, isAuthenticated };
}
