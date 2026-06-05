"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import dynamic from "next/dynamic";

const BottomNav = dynamic(
  () => import("@/components/layout/BottomNav").then((m) => m.BottomNav),
  { ssr: false }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Admin and Vendor layouts handle their own full-screen wrappers and Sidebars
  if (pathname?.startsWith("/dashboard/admin") || pathname?.startsWith("/dashboard/vendor")) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-[#F7F7F7] pt-[185px] md:pt-[160px] pb-16 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </div>
      </div>
      <Footer />
      <CartDrawer />
      <BottomNav />
    </ProtectedRoute>
  );
}
