"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "USER" | "VENDOR" | "ADMIN";
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // `initialized` is set once and never reset — safe to use without `mounted` state.
  // `loading` is only true during the very first session check.
  const { isAuthenticated, user, loading, initialized } = useAuthStore();

  useEffect(() => {
    // Wait until the one-time auth check is complete before making any decision.
    if (!initialized || loading) return;

    if (!isAuthenticated) {
      if (pathname.startsWith("/dashboard/vendor")) {
        router.replace(`/vendor/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (pathname.startsWith("/dashboard/admin")) {
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
      return;
    }

    if (requiredRole) {
      const hasRole = user?.roles?.includes(requiredRole as any) || user?.isAdmin;
      if (!hasRole) {
        router.replace("/");
        return;
      }

      // ── Strict Vendor Approval Check ──────────────────────────────────────
      if (requiredRole === "VENDOR" && !user?.isAdmin) {
        const isApproved = user?.vendorStatus === "ACTIVE" || user?.vendorStatus === "APPROVED";
        if (!isApproved) {
          router.replace("/vendor/status");
          return;
        }
      }
    }
  }, [initialized, loading, isAuthenticated, user, router, pathname, requiredRole]);

  // Show spinner only during the one-time initial auth check.
  // After that, `initialized` stays true across page navigations — no flash.
  if (!initialized || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-[3px] border-[#A6D608]/20 border-t-[#A6D608] rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Verifying session…
        </p>
      </div>
    );
  }

  // Render nothing while the role-mismatch redirect is in-flight
  if (!isAuthenticated) return null;
  if (requiredRole === "VENDOR" && !user?.isVendor && !user?.isAdmin) return null;

  return <>{children}</>;
};
