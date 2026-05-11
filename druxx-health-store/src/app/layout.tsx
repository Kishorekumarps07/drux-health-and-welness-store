import { Suspense } from "react";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { BottomNav } from "@/components/layout/BottomNav";
import { SessionManager } from "@/components/auth/SessionManager";
import { Toaster } from "sonner";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Druxx Health Store ΓÇö Premium Health & Wellness Products",
    template: "%s | Druxx Health Store",
  },
  description:
    "Shop premium vitamins, supplements, organic foods, herbal products, and fitness nutrition from verified vendors at Druxx Health Store. Fast delivery across India.",
  keywords: [
    "health store",
    "vitamins",
    "supplements",
    "organic food",
    "ayurvedic",
    "sports nutrition",
    "wellness",
    "druxx health",
  ],
  openGraph: {
    title: "Druxx Health Store",
    description: "Premium Health & Wellness Products",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lexend.variable} font-sans`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased" suppressHydrationWarning>
        <Suspense fallback={null}>
          <main className="flex-1">{children}</main>
          <SessionManager />
          <Toaster position="top-center" richColors />
        </Suspense>
      </body>
    </html>
  );
}
