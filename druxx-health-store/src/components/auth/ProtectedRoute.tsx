"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "USER" | "VENDOR" | "ADMIN";
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, loading, initialized } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only make a decision once the page is mounted AND the auth system is finished checking
    if (mounted && initialized && !loading) {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login from:", pathname);
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (requiredRole) {
        const hasRole = user?.roles?.includes(requiredRole as any) || user?.isAdmin;
        
        if (!hasRole) {
          router.replace("/");
        }
      }
    }
  }, [mounted, isAuthenticated, loading, initialized, user, router, pathname, requiredRole]);

  // Handle server-side rendering or loading
  if (!mounted || !initialized || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#A6D608]/20 border-t-[#A6D608] rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verifying Security...</p>
      </div>
    );
  }

  // Final role check for rendering
  if (requiredRole === "VENDOR" && !user?.isVendor && !user?.isAdmin) return null;

  return <>{children}</>;
};
