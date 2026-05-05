"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User, Grid, Heart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export function BottomNav() {
  const pathname = usePathname();
  const totalItemsCount = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Shop", icon: Grid, href: "/products" },
    { label: "Orders", icon: ShoppingBag, href: "/dashboard/orders" },
    { label: "Account", icon: User, href: isAuthenticated ? "/dashboard" : "/login" },
  ];

  if (!mounted) return null;

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
      <nav 
        className="rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10 backdrop-blur-2xl px-2 py-2 flex items-center justify-between relative overflow-hidden"
        style={{ 
          background: "linear-gradient(110deg, rgba(30, 30, 30, 0.7) 0%, rgba(30, 30, 30, 0.85) 50%, rgba(30, 30, 30, 0.7) 100%)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)"
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.label === "Search" && pathname === "/products");
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1.5 flex-1 h-14 transition-all duration-300 active:scale-90 ${
                isActive ? "text-[#A6D608]" : "text-gray-500"
              }`}
            >
              {/* Active Indicator Pill */}
              {isActive && (
                <div className="absolute inset-0 mx-1.5 my-1.5 bg-gradient-to-tr from-[#A6D608]/20 to-[#A6D608]/5 rounded-2xl animate-in fade-in zoom-in-95 duration-300" />
              )}
              
              <div className="relative z-10 flex flex-col items-center">
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 3 : 2} 
                  className={isActive ? "drop-shadow-[0_0_10px_rgba(166,214,8,0.4)]" : ""} 
                />
                <span className={`text-[10px] font-bold uppercase tracking-tight mt-1 truncate max-w-[50px] ${
                  isActive ? "text-[#A6D608]" : "text-gray-900"
                }`}>
                  {item.label}
                </span>
                
                {item.label === "Orders" && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF7A00] rounded-full border border-[#1E1E1E]" />
                )}
              </div>
            </Link>
          );
        })}

        {/* Floating Cart Launcher in Nav */}
        <button
          onClick={toggleCart}
          className="relative flex flex-col items-center justify-center gap-1.5 flex-1 h-14 transition-all active:scale-90"
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className={`transition-all duration-300 ${totalItemsCount > 0 ? "text-[#FF7A00]" : "text-gray-500"}`}>
              <ShoppingBag size={20} strokeWidth={totalItemsCount > 0 ? 3 : 2} />
            </div>
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 h-4 w-4 bg-[#FF7A00] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-[#1E1E1E] shadow-lg animate-bounce-subtle">
                {totalItemsCount}
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-tight mt-1 ${
              totalItemsCount > 0 ? "text-[#FF7A00]" : "text-gray-900"
            }`}>
              Cart
            </span>
          </div>
        </button>
      </nav>
    </div>
  );
}
