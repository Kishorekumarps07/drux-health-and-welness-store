"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import dynamic from "next/dynamic";

const CartDrawer = dynamic(
  () => import("@/components/layout/CartDrawer").then((m) => m.CartDrawer),
  { ssr: false }
);

const BottomNav = dynamic(
  () => import("@/components/layout/BottomNav").then((m) => m.BottomNav),
  { ssr: false }
);

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMinimalPage = pathname === "/login" || pathname === "/checkout";

  return (
    <>
      {!isMinimalPage && <Navbar />}
      <main className={`flex-1 ${!isMinimalPage ? 'pt-[185px] md:pt-[160px]' : ''} pb-16 lg:pb-0`}>
        {children}
      </main>
      {!isMinimalPage && <Footer />}
      {!isMinimalPage && <CartDrawer />}
      {!isMinimalPage && <BottomNav />}
    </>
  );
}
