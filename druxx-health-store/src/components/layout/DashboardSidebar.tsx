"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Users,
  Store,
  LogOut,
  UserCircle,
  ShieldCheck,
  Settings,
  CreditCard,
  HelpCircle,
  History,
  Activity,
  ChevronRight,
  Monitor,
  LayoutGrid,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

const ADMIN_NAV: NavItem[] = [
  { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Vendors Hub', href: '/dashboard/admin/vendors', icon: Store },
  { name: 'Category Manager', href: '/dashboard/admin/categories', icon: LayoutGrid },
  { name: 'Global Orders', href: '/dashboard/admin/orders', icon: ShoppingBag },
  { name: 'Platform Users', href: '/dashboard/admin/users', icon: Users },
  { name: 'CMS Management', href: '/dashboard/admin/cms', icon: Monitor },
  { name: 'Coupon Manager', href: '/dashboard/admin/coupons', icon: Tag },
  { name: 'Inventory Audit', href: '/dashboard/admin/inventory', icon: Package },
  { name: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: History },
];

const VENDOR_NAV: NavItem[] = [
  { name: 'Overview', href: '/dashboard/vendor', icon: LayoutDashboard },
  { name: 'My Products', href: '/dashboard/vendor/inventory', icon: Package },
  { name: 'Manage Orders', href: '/dashboard/vendor/orders', icon: ShoppingBag },
  { name: 'Coupon Manager', href: '/dashboard/vendor/coupons', icon: Tag },
  { name: 'Analytics', href: '/dashboard/vendor/analytics', icon: BarChart3 },
  { name: 'Payments', href: '/dashboard/vendor/payments', icon: CreditCard },
  { name: 'Store Settings', href: '/dashboard/vendor/settings', icon: Settings },
  { name: 'Help Center', href: '/dashboard/vendor/help', icon: HelpCircle },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  
  const isAdmin = user?.roles.includes('ADMIN') && pathname.includes('/admin');
  const navigation = isAdmin ? ADMIN_NAV : VENDOR_NAV;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed inset-y-0 left-0 h-screen w-[260px] z-50 flex flex-col transition-transform duration-300 border-r",
        isAdmin ? "bg-[#0B0F14] border-[#1F2937]" : "bg-white border-gray-100",
        isOpen ? "translate-x-0" : "max-lg:-translate-x-full"
      )}>
        <div className="py-6 px-10 flex items-center justify-center border-b border-[#1F2937]/10 dark:border-gray-50/5">
          <Link href="/" className="flex flex-col items-center group w-full">
            <div className="h-[120px] flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <img 
                src="/druxlogo.png" 
                alt="Drux Logo" 
                className={cn("h-full object-contain", isAdmin && "brightness-0 invert")}
                style={{ height: "120px" }}
              />
            </div>
          </Link>
          
          {/* Close for mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="lg:hidden h-8 w-8 rounded-lg text-gray-500"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Button>
        </div>

        {/* 2. Navigation Section (Centered Vertically) */}
        <div className="flex-1 flex flex-col justify-center px-4 overflow-y-auto custom-scrollbar py-6">
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group",
                    isActive 
                      ? (isAdmin ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#A6D608] text-white shadow-lg shadow-[#A6D608]/20")
                      : (isAdmin ? "text-[#9CA3AF] hover:bg-[#1F2937]/50 hover:text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900")
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive 
                      ? (isAdmin ? "text-[#10B981]" : "text-white")
                      : (isAdmin ? "text-[#6B7280] group-hover:text-white" : "text-gray-400 group-hover:text-[#A6D608]")
                  )} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. Footer Section (Pinned Bottom) */}
        <div className={cn(
          "p-5 border-t",
          isAdmin ? "border-[#1F2937]" : "border-gray-50 bg-gray-50/30"
        )}>
           <div className={cn(
             "rounded-2xl p-3 flex items-center gap-3 mb-4 border transition-all",
             isAdmin ? "bg-[#111827] border-[#1F2937]" : "bg-white border-gray-100 shadow-sm"
           )}>
              <div className={cn(
                "w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shrink-0",
                isAdmin ? "bg-[#1F2937]" : "bg-gray-50 border border-gray-100"
              )}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name || "User Avatar"} className="object-cover w-full h-full" />
                ) : (
                  <UserCircle className={cn("w-6 h-6", isAdmin ? "text-[#9CA3AF]" : "text-gray-300")} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-black truncate", isAdmin ? "text-white" : "text-gray-900")}>
                  {user?.name}
                </p>
                <p className={cn("text-[9px] font-bold uppercase tracking-widest", isAdmin ? "text-[#10B981]" : "text-[#A6D608]")}>
                  {isAdmin ? "Admin" : "Partner"}
                </p>
              </div>
           </div>
           <Button 
            variant="ghost" 
            onClick={() => {
              logout();
              onClose?.();
            }}
            className={cn(
              "w-full justify-start gap-3 rounded-xl font-bold px-4 h-11 transition-all text-xs uppercase tracking-widest",
              isAdmin 
                ? "text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/10" 
                : "text-gray-400 hover:text-red-500 hover:bg-red-50"
            )}
           >
              <LogOut className="w-4 h-4" />
              Sign Out
           </Button>
        </div>
      </aside>
    </>
  );
}
