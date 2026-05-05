"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  Store,
  ChevronLeft,
  Bell,
  Search,
  UserCircle,
  LogOut,
  HelpCircle,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

const navigation = [
  { group: 'Operational', items: [
    { name: 'Overview', href: '/dashboard/vendor', icon: LayoutDashboard },
    { name: 'Inventory', href: '/dashboard/vendor/inventory', icon: Package },
    { name: 'Orders', href: '/dashboard/vendor/orders', icon: ShoppingBag },
  ]},
  { group: 'Intelligence', items: [
    { name: 'Analytics', href: '/dashboard/vendor/analytics', icon: BarChart3 },
    { name: 'Payments', href: '/dashboard/vendor/payments', icon: FileText },
  ]},
  { group: 'Settings', items: [
    { name: 'Store Settings', href: '/dashboard/vendor/settings', icon: Settings },
    { name: 'Help Center', href: '/dashboard/vendor/help', icon: HelpCircle },
  ]},
]

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <ProtectedRoute requiredRole="VENDOR">
      <div className="h-screen overflow-hidden bg-[#F8F9FA] flex transform-gpu">
        <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-[260px] h-full overflow-y-auto custom-scrollbar">
        {/* Modern Header */}
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 px-6 lg:px-10 flex flex-col justify-center">
            <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile Toggle */}
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <Search className="w-6 h-6 rotate-90" />
                </button>
                <div className="hidden sm:flex items-center gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest italic">
                 <Link href="/" className="hover:text-gray-900 transition-colors">Druxx</Link>
                 <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                 <span className="text-gray-900 font-black">Vendor Portal</span>
                </div>
              </div>

            <div className="flex items-center gap-6">
                <div className="relative group hidden md:block">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#A6D608] transition-colors" />
                   <input type="text" placeholder="Quick search..." className="pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A6D608]/20 transition-all w-64" />
                </div>
                
                <div className="relative cursor-pointer group">
                   <div className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                      <Bell className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors shadow-sm" />
                   </div>
                   <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF7A00] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce-short">3</span>
                </div>

                <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                   <div className="text-right">
                      <p className="text-sm font-black text-gray-900 italic leading-none">{user?.name}</p>
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter mt-1">Merchant Account</p>
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-gray-50 border-2 border-[#A6D608]/20 flex items-center justify-center overflow-hidden shadow-sm">
                      {user?.avatar ? <img src={user.avatar} alt={user.name || "User Avatar"} className="w-full h-full object-cover" /> : <UserCircle className="w-7 h-7 text-gray-300" />}
                   </div>
                </div>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <div className="p-6 lg:p-10 max-w-[1280px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}
