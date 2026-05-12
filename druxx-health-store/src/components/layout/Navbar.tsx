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



export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              const exactArea = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || addr.road;
              const baseCity = addr.city || addr.town || addr.village || addr.state_district;
              const detectedCity = exactArea && baseCity && exactArea !== baseCity 
                ? `${exactArea}, ${baseCity}` 
                : exactArea || baseCity || "Current Location";
              const detectedPincode = addr.postcode || "560001";
              setLocation({ city: detectedCity, pincode: detectedPincode });
            }
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
      className={`fixed top-0 left-0 right-0 z-50 w-full flex flex-col transition-all duration-300 ${
        scrolled ? "shadow-lg bg-white/95 backdrop-blur-lg" : "bg-white/80 backdrop-blur-md"
      }`}
    >
      {/* Top Row: Main Navigation Hub */}
      <div className="text-[#1E1E1E] px-4 py-2 border-b border-gray-100/50">
        <div className="w-full flex md:flex-row items-center relative lg:h-24 px-0">
          {/* Mobile Grid Layout - only for small screens */}
          <div className="grid grid-cols-3 items-center w-full md:hidden h-14">
            {/* Left: Hamburger */}
            <div className="flex items-center">
              {pathname !== "/" ? (
                <button 
                  onClick={() => router.back()}
                  className="p-2 -ml-2 text-[#1E1E1E] hover:text-[#A6D608] transition-colors flex items-center gap-1 active:scale-90"
                >
                  <ChevronLeft size={24} />
                </button>
              ) : (
                <button 
                  onClick={() => setMobileOpen(true)}
                  className="p-2 -ml-2 text-[#1E1E1E] hover:text-[#A6D608] transition-colors"
                >
                  <Menu size={24} />
                </button>
              )}
            </div>

            {/* Center: Logo */}
            <div className="flex justify-center">
              <Link href="/" className="flex items-center gap-2 p-0.5 border border-transparent hover:border-black rounded transition-colors group">
                <div className="relative w-52 h-13">
                  <Image
                    src="/logo.png"
                    alt="Drux Health Store"
                    fill
                    className="object-contain"
                    sizes="208px"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Right: Cart */}
            <div className="flex items-center justify-end">
              <div className="relative">
                <button
                  onClick={toggleCart}
                  className="relative p-2 border border-transparent hover:border-black rounded transition-colors"
                >
                  <ShoppingCart size={24} className="text-[#A6D608]" />
                  {mounted && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] font-black bg-[#FF7A00] text-white border-2 border-white rounded-full">
                      {totalItemsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout - only for md and up */}
          <div className="hidden md:flex items-center w-full gap-4 lg:gap-8">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 p-1 border border-transparent hover:border-black rounded transition-colors group">
              <div className="relative w-56 h-14 lg:w-80 lg:h-20">
                <Image
                  src="/logo.png"
                  alt="Drux Health Store"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 224px, 320px"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Actions Row */}
            <div className="flex-1 flex items-center gap-2 lg:gap-4">
              {/* Search Bar */}
              <div className="flex-1 max-w-2xl">
                <SearchBar />
              </div>

              {/* Location */}
              <button 
                onClick={() => setShowLocationModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 border border-transparent hover:border-black rounded transition-all text-left group shrink-0"
              >
                <MapPin size={18} className="text-gray-500 group-hover:text-[#A6D608]" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">Deliver to</span>
                  <span className="text-[13px] font-black text-gray-900">{location.city}</span>
                </div>
              </button>

              {/* Account */}
              <div className="relative group/account shrink-0">
                <button className="flex items-center gap-1.5 px-3 py-2 border border-transparent hover:border-black rounded transition-colors">
                  <User size={18} className="text-gray-500" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">Hello, Sign In</span>
                    <span className="text-[13px] font-black text-gray-900">Account & Lists</span>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                <div className="absolute top-full right-0 pt-1 opacity-0 invisible group-hover/account:opacity-100 group-hover/account:visible transition-all duration-300 z-[100]">
                  <NavAccountDropdown />
                </div>
              </div>



              {/* Cart */}
              <button
                onClick={toggleCart}
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
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Row & Location */}
      <div className="md:hidden px-3 pb-2 flex flex-col gap-2">
        <SearchBar />
        
        {/* Mobile Location Display / Trigger */}
        <button 
          onClick={() => setShowLocationModal(true)}
          className="flex items-center justify-between w-full px-3 py-2 bg-gray-50/80 hover:bg-gray-100 rounded-xl border border-gray-100/80 transition-all text-left group active:scale-[0.99]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={15} className="text-[#A6D608] shrink-0" />
            <div className="flex items-center gap-1.5 truncate text-xs">
              <span className="font-bold text-gray-400 uppercase text-[10px] tracking-tight shrink-0">Deliver to:</span>
              <span className="font-black text-gray-800 truncate">{location.city}</span>
              {location.pincode && location.pincode !== "560001" && (
                <span className="font-bold text-gray-400 text-[10px]">({location.pincode})</span>
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
                href={`/products?category=${cat.name}`}
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
            <div className="h-3 w-px bg-gray-200" />
            <p className="text-[9px] font-black text-[#FF7A00] animate-pulse uppercase tracking-widest">
                DRUXX10 — Save Extra 10%
            </p>
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
                     <span className="text-sm font-black text-gray-900 leading-none mt-1 truncate block">{location.city}, {location.pincode}</span>
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
