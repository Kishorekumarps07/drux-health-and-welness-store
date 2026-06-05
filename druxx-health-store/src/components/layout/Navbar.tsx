"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
  ChevronDown,
  MapPin,
  Phone,
  Store,
  Package,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SearchBar } from "@/components/layout/SearchBar";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import { NavAccountDropdown } from "./navbar/NavAccountDropdown";
import { NavCartPreview } from "./navbar/NavCartPreview";
import api from "@/lib/api";
import { LocationModal } from "./navbar/LocationModal";
import { CustomerNotifications } from "@/components/layout/CustomerNotifications";
import { toast } from "sonner";
import { couponService, Coupon } from "@/services/couponService";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    const fetchActiveCoupons = async () => {
      try {
        const fetched = await couponService.getActiveCoupons();
        setActiveCoupons(fetched || []);
      } catch (err) {
        console.error("Failed to load active coupons in navbar", err);
      }
    };
    fetchActiveCoupons();
  }, []);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { location, setLocation, categories, fetchCategories } = useMarketplaceStore();
  
  const totalItemsCount = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const subtotal = useCartStore((s) => s.subtotal());
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    if (categories.length === 0) {
      fetchCategories();
    }

    // Automatic Geolocation Tracker on webapp load
    if (typeof window !== "undefined" && navigator.geolocation && !sessionStorage.getItem("druxx_location_detected")) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            sessionStorage.setItem("druxx_location_detected", "true");
            const { latitude, longitude } = position.coords;
            const { reverseGeocode } = await import("@/lib/geocode");
            const result = await reverseGeocode(latitude, longitude);
            setLocation(result);
          } catch (err) {
            console.error("Auto location tracking failed:", err);
          }
        },
        (error) => {
          console.warn("Geolocation permission denied or error:", error);
          sessionStorage.setItem("druxx_location_detected", "true");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
  }, [fetchCategories, categories.length, setLocation]);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <header
      className={`fixed z-50 flex flex-col transition-all duration-300 ${
        scrolled
          ? "shadow-none bg-transparent backdrop-blur-none top-0 left-0 right-0 rounded-none md:top-3 md:left-3 md:right-3 md:rounded-[24px] md:border md:border-white/50 md:shadow-xl md:bg-white/95 md:backdrop-blur-2xl"
          : "shadow-lg bg-white/60 backdrop-blur-xl top-3 left-3 right-3 rounded-[20px] md:rounded-[24px] border border-white/50"
      }`}
    >
      {/* Top Row: Main Navigation Hub */}
      <div
        className={`text-[#1E1E1E] px-4 transition-all duration-300 ${
          scrolled
            ? "h-0 opacity-0 overflow-hidden py-0 border-b-0 pointer-events-none"
            : "py-2 border-b border-gray-100/50"
        } md:h-auto md:opacity-100 md:overflow-visible md:py-2 md:border-b md:border-gray-100/50 md:pointer-events-auto`}
      >
        <div className="w-full flex md:flex-row items-center relative lg:h-24 px-0">
          {/* Mobile Grid Layout */}
          <div className="flex items-center justify-between w-full md:hidden h-14">
            {/* Left: Hamburger & Back */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setMobileOpen(true)}
                className="p-2 text-[#1E1E1E] hover:text-[#A6D608] transition-colors"
                aria-label="Menu"
              >
                <Menu size={24} />
              </button>
              {pathname !== "/" && (
                <button 
                  onClick={() => router.back()}
                  className="p-2 text-[#1E1E1E] hover:text-[#A6D608] transition-colors"
                  aria-label="Back"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
            </div>

            {/* Center: Logo */}
            <div className="flex-1 flex justify-center px-2">
              <Link href="/" className="flex items-center group">
                <Image
                  src="/druxlogo.png"
                  alt="Drux Health Store"
                  width={90}
                  height={60}
                  className="h-[52px] w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Right: Cart */}
            <div className="flex items-center w-12 justify-end">
              <Link
                href="/cart"
                className="relative p-2"
              >
                <ShoppingCart size={24} className="text-[#A6D608]" />
                {mounted && totalItemsCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center text-[9px] font-black bg-[#FF7A00] text-white border-2 border-white rounded-full">
                    {totalItemsCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop Layout - only for md and up */}
          <div className="hidden md:flex items-center justify-between w-full gap-4 lg:gap-8">
            {/* Logo (Left side) */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 p-1 border border-transparent hover:border-black rounded transition-colors group">
              <Image
                src="/druxlogo.png"
                alt="Drux Health Store"
                width={162}
                height={108}
                className="h-[92px] w-auto object-contain"
                priority
              />
            </Link>

            {/* Search Bar (Centered) */}
            <div className="flex-1 flex justify-center max-w-2xl mx-auto">
              <div className="w-full">
                <SearchBar />
              </div>
            </div>

            {/* Right Side Actions: Location, Account, Cart */}
            <div className="flex items-center gap-2 lg:gap-4 shrink-0">
              {/* Location */}
              <button 
                onClick={() => setShowLocationModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 border border-transparent hover:border-black rounded transition-all text-left group shrink-0 min-w-0"
              >
                <MapPin size={18} className={`shrink-0 transition-colors ${location.city ? 'text-[#A6D608]' : 'text-gray-400 group-hover:text-[#A6D608]'}`} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">
                    {location.city ? "Deliver to" : "Set delivery"}
                  </span>
                  {location.city ? (
                    <span className="text-[13px] font-black text-gray-900 truncate max-w-[160px]">
                      {location.city}
                      {location.pincode && (
                        <span className="text-[11px] font-bold text-gray-400 ml-1">· {location.pincode}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[13px] font-black text-[#A6D608]">Select Location</span>
                  )}
                </div>
              </button>

              {/* Account */}
              <div className="relative group/account shrink-0">
                <button className="flex items-center gap-1.5 px-3 py-2 border border-transparent hover:border-black rounded transition-colors">
                  <User size={18} className="text-gray-500" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">
                      {mounted && isAuthenticated && user ? `Hello, ${user.name.split(" ")[0]}` : "Hello, Sign In"}
                    </span>
                    <span className="text-[13px] font-black text-gray-900">Account & Lists</span>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                <div className="absolute top-full right-0 pt-1 opacity-0 invisible group-hover/account:opacity-100 group-hover/account:visible transition-all duration-300 z-[100]">
                  <NavAccountDropdown />
                </div>
              </div>

              {/* Notifications */}
              <CustomerNotifications />

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center gap-2 px-3 py-2 border border-transparent hover:border-black rounded transition-colors shrink-0"
              >
                <div className="relative">
                  <ShoppingCart size={24} className="text-[#A6D608]" />
                  {mounted && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center text-[9px] font-black bg-[#FF7A00] text-white border-2 border-white rounded-full">
                      {totalItemsCount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-black text-gray-900">Cart</span>
                  <span className="text-[11px] font-bold text-[#FF7A00]">₹{mounted ? subtotal.toLocaleString("en-IN") : "0"}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Row & Location */}
      <div
        className={`md:hidden px-4 flex flex-col transition-all duration-300 ${
          scrolled ? "py-2 gap-0" : "pb-3 pt-0 gap-2"
        }`}
      >
        <SearchBar />
        
        {/* Mobile Location Display / Trigger */}
        <button 
          onClick={() => setShowLocationModal(true)}
          className={`flex items-center justify-between w-full px-3 py-2 bg-gray-50/80 hover:bg-gray-100 rounded-xl border border-gray-100/80 transition-all text-left group active:scale-[0.99] ${
            scrolled ? "max-h-0 opacity-0 overflow-hidden py-0 border-0 pointer-events-none mt-0 mb-0" : "max-h-12 opacity-100 mt-1"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={15} className={`shrink-0 ${location.city ? 'text-[#A6D608]' : 'text-gray-400'}`} />
            <div className="flex items-center gap-1.5 truncate text-xs">
              {location.city ? (
                <>
                  <span className="font-bold text-gray-400 uppercase text-[10px] tracking-tight shrink-0">Deliver to:</span>
                  <span className="font-black text-gray-800 truncate">{location.city}</span>
                  {location.pincode && (
                    <span className="font-bold text-gray-400 text-[10px] shrink-0">· {location.pincode}</span>
                  )}
                </>
              ) : (
                <span className="font-black text-[#A6D608]">Select your delivery location</span>
              )}
            </div>
          </div>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
        </button>
      </div>

      {/* Bottom Row: Dense Nav */}
      <div className="text-[#1E1E1E] px-4 border-b border-gray-100/50 hidden md:block">
        <div className="w-full flex items-center min-h-[32px]">
          <button 
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 border border-transparent hover:border-black rounded transition-all text-[11px] font-black"
          >
            <Menu size={16} />
            All
          </button>

          <nav className="flex items-center overflow-x-auto hide-scrollbar ml-1 gap-0.5 uppercase tracking-tight">
            {isAuthenticated && user?.roles.includes('ADMIN') && user.activeRole === 'ADMIN' && (
              <Link
                 href="/dashboard/admin"
                 className="px-2 py-1 text-[11px] font-black text-[#08D6A6] hover:border hover:border-black rounded transition-all whitespace-nowrap group italic"
              >
                 Admin Panel
              </Link>
            )}
            {isAuthenticated && user?.roles.includes('VENDOR') && (user.activeRole === 'VENDOR' || !user.roles.includes('ADMIN')) && (
              <Link
                 href="/dashboard/vendor"
                 className="px-2 py-1 text-[11px] font-black text-[#A6D608] hover:border hover:border-black rounded transition-all whitespace-nowrap group italic"
              >
                 Vendor Hub
              </Link>
            )}
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="px-2 py-1 text-[10px] font-bold hover:border hover:border-black rounded transition-all whitespace-nowrap opacity-90 hover:opacity-100 uppercase tracking-tight"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <Link href="/dashboard/orders" className="text-[10px] font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-1">
                <Package size={12} className="text-[#A6D608]" /> Track Order
            </Link>
            
            {activeCoupons.length > 0 && (
              <>
                <div className="h-3 w-px bg-gray-200" />
                <div className="relative group">
                  <div className="bg-orange-50 border border-orange-100 hover:bg-orange-100/80 transition-all text-[#FF7A00] text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/5 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-ping" />
                    <span>Use Code: <strong className="underline tracking-wider">{activeCoupons[0].code}</strong> (Save {activeCoupons[0].discountPercent}%)</span>
                  </div>
                  
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">Available Coupons</p>
                    <div className="space-y-1.5">
                      {activeCoupons.map((coupon) => (
                        <div 
                          key={coupon.id} 
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                            toast.success(`Coupon code ${coupon.code} copied!`);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50 hover:bg-[#A6D608]/5 border border-transparent hover:border-[#A6D608]/20 transition-all cursor-pointer group/item"
                        >
                          <span className="text-[10px] font-black text-gray-800 tracking-wider font-mono">{coupon.code}</span>
                          <span className="text-[10px] font-black text-[#A6D608]">-{coupon.discountPercent}%</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[8px] text-gray-400 text-center mt-2.5">Click any code to copy</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <LocationModal 
        open={showLocationModal} 
        onOpenChange={setShowLocationModal} 
      />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[300px] p-0 border-r-0 bg-white">
          <div className="flex flex-col h-full overflow-hidden">
            <div className="bg-gray-50 p-6 flex flex-col gap-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-[#A6D608]/30 shadow-sm">
                     {isAuthenticated && user?.avatar ? (
                       <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                     ) : (
                       <User size={24} className="text-[#A6D608]" />
                     )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-[11px] uppercase font-bold tracking-widest">Welcome,</span>
                    <span className="text-gray-900 font-black text-lg truncate max-w-[140px]">
                      {isAuthenticated ? user?.name.split(" ")[0] : "Sign In"}
                    </span>
                  </div>
                </div>

              </div>

              {!isAuthenticated && (
                <Button asChild className="w-full bg-[#A6D608] hover:bg-[#8ab506] text-[#1E1E1E] font-bold h-11">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>Sign in to your account</Link>
                </Button>
              )}
            </div>

            {activeCoupons.length > 0 && (
              <div className="bg-orange-50/50 border-b border-orange-100/50 p-5 shrink-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Active Promos</p>
                <div className="flex gap-2.5 overflow-x-auto pb-1 px-1 no-scrollbar">
                  {activeCoupons.map((coupon) => (
                    <div 
                      key={coupon.id} 
                      onClick={() => {
                        navigator.clipboard.writeText(coupon.code);
                        toast.success(`Coupon code ${coupon.code} copied!`);
                      }}
                      className="flex-shrink-0 bg-white border border-orange-100 rounded-xl p-3 flex items-center justify-between gap-6 cursor-pointer hover:border-orange-200 transition-all shadow-sm active:scale-[0.98]"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900 font-mono tracking-wider">{coupon.code}</span>
                        <span className="text-[9px] font-bold text-gray-400 mt-0.5">Click to copy</span>
                      </div>
                      <div className="bg-orange-50 text-[#FF7A00] font-black text-xs px-2.5 py-1 rounded-lg">
                        -{coupon.discountPercent}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6">
                <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Shop By Category</h3>
                <div className="grid gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-[#A6D608]/5 border border-transparent hover:border-[#A6D608]/20 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl scale-110 grayscale-[0.5] group-hover:grayscale-0 transition-all">{cat.icon}</span>
                        <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{cat.name}</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 p-6">
                <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Help & Account</h3>
                <div className="grid grid-cols-1 gap-1">
                   {[
                    { label: "Your Account", icon: <User size={16} />, href: "/dashboard" },
                    { label: "Your Orders", icon: <Package size={16} />, href: "/dashboard/orders" },
                    { label: "Wishlist", icon: <Heart size={16} />, href: "#" },
                    { label: "Customer Service", icon: <Phone size={16} />, href: "/products" },
                    { label: "Flash Sale", icon: <Store size={16} />, href: "/products", color: "text-[#FF7A00]" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all ${item.color || "text-gray-600"}`}
                    >
                      {item.icon} <span className="text-sm font-bold">{item.label}</span>
                    </Link>
                  ))}
                  
                  {isAuthenticated && (
                     <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 text-red-500 transition-all"
                     >
                        <LogOut size={16} /> <span className="text-sm font-bold">Sign Out</span>
                     </button>
                  )}
                </div>
              </div>
            </nav>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100">
               <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden whitespace-nowrap">
                  <MapPin size={20} className="text-[#A6D608]" />
                  <div className="flex-1 min-w-0">
                     <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tight block">Deliver to</span>
                     {location.city ? (
                       <span className="text-sm font-black text-gray-900 leading-none mt-1 truncate block">
                         {location.city}{location.pincode ? ` · ${location.pincode}` : ""}
                       </span>
                     ) : (
                       <span className="text-sm font-black text-[#A6D608] leading-none mt-1 block">Select Location</span>
                     )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="flex-shrink-0" 
                    onClick={() => { setMobileOpen(false); setShowLocationModal(true); }}
                  >
                     <ChevronRight size={18} className="text-gray-300" />
                  </Button>
               </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
