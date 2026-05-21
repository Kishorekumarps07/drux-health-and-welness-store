"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { 
  Bell, 
  Search, 
  ChevronRight,
  UserCircle
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { AdminNotifications } from "@/components/admin/AdminNotifications";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div 
        className="h-screen overflow-hidden bg-[#0B0F14] text-[#E5E7EB] flex transform-gpu font-sans selection:bg-[#10B981]/30 selection:text-white"
        style={{ fontFamily: 'var(--font-lexend), sans-serif' }}
      >
        <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <AdminSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        
        <main className="flex-1 lg:pl-[260px] h-full overflow-y-auto custom-scrollbar transition-all duration-300">
          {/* Admin Header Content Constrained */}
          <header className="h-24 bg-[#0B0F14]/80 backdrop-blur-xl border-b border-[#1F2937] sticky top-0 z-40 px-6 lg:px-10 flex flex-col justify-center">
            <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile Toggle */}
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 -ml-2 text-[#9CA3AF] hover:text-white transition-colors"
                >
                  <Search className="w-6 h-6 rotate-90" /> {/* Using Search as a placeholder icon or finding Menu */}
                </button>
                <div className="hidden sm:flex items-center gap-4 text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest">
                  <Link href="/" className="hover:text-white transition-colors">Platform</Link>
                  <ChevronRight className="w-3 h-3 text-[#374151]" />
                  <span className="text-[#E5E7EB] font-black">Admin Command Center</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative group hidden md:block" onClick={() => setIsSearchOpen(true)}>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] group-focus-within:text-[#10B981] transition-colors" />
                  <div className="pl-11 pr-4 py-2.5 bg-[#111827] border border-[#1F2937] rounded-xl text-sm font-medium text-[#4B5563] cursor-pointer hover:border-[#10B981]/30 transition-all w-64 flex items-center justify-between shadow-inner">
                    <span>Universal search...</span>
                    <span className="text-[10px] font-black bg-[#1F2937] px-1.5 py-0.5 rounded border border-[#374151] text-[#9CA3AF]">⌘K</span>
                  </div>
                </div>
                
                <AdminNotifications />

                <div className="flex items-center gap-4 pl-6 border-l border-[#1F2937]">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-white">{user?.name}</p>
                    <p className="text-[9px] text-[#10B981] font-black uppercase tracking-widest">Super Admin</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#111827] border border-[#1F2937] flex items-center justify-center overflow-hidden shadow-sm hover:border-[#10B981]/50 cursor-pointer transition-all">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name || "User Avatar"} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="w-6 h-6 text-[#9CA3AF]" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content Constrained to 1280px */}
          <div className="max-w-[1280px] mx-auto w-full px-6 lg:px-10 py-8 space-y-8 min-h-[calc(100vh-6rem)]">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
