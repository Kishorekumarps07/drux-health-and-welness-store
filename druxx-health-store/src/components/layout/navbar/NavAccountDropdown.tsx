"use client";

import Link from "next/link";
import { User, Package, Heart, Settings, LogOut, ChevronRight, Store } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export function NavAccountDropdown() {
  const { user, isAuthenticated, logout, setActiveRole } = useAuthStore() as any;

  return (
    <div className="w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {!isAuthenticated ? (
        <div className="p-6 text-center border-b border-gray-50">
          <Button asChild className="w-full bg-[#A6D608] hover:bg-[#8ab506] text-[#1E1E1E] font-bold py-6 rounded-xl shadow-lg shadow-brand/20">
            <Link href="/login">Sign In</Link>
          </Button>
          <p className="mt-3 text-xs text-gray-500">
            New customer? <Link href="/register" className="text-[#A6D608] font-bold hover:underline">Start here</Link>
          </p>
        </div>
      ) : (
        <div className="p-4 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
               {user?.avatar ? (
                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <User size={20} className="text-gray-400" />
               )}
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
              <p className="text-[11px] text-gray-500 mt-1 truncate max-w-[150px]">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="py-2">
          <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Account</p>
          <div className="space-y-0.5">
            <Link href="/dashboard" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-[#A6D608]/5 hover:text-[#A6D608] transition-all group">
               Profile <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all font-bold" />
            </Link>
            <Link href="/dashboard/orders" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-[#A6D608]/5 hover:text-[#A6D608] transition-all group">
               Orders <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all font-bold" />
            </Link>
            <Link href="/dashboard" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-[#A6D608]/5 hover:text-[#A6D608] transition-all group">
               Wishlist <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all font-bold" />
            </Link>
          </div>
        </div>
        <div className="py-2">
          <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Settings</p>
          <div className="space-y-0.5">
            <Link href="/dashboard" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-[#A6D608]/5 hover:text-[#A6D608] transition-all group">
               Security <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all font-bold" />
            </Link>
            <Link href="/dashboard" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-[#A6D608]/5 hover:text-[#A6D608] transition-all group">
               Addresses <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all font-bold" />
            </Link>
          </div>
        </div>
      </div>

      {isAuthenticated && user?.roles && user.roles.length > 0 && (
        <div className="p-2 bg-gray-50/30 border-t border-gray-100">
           <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Management Portals</p>
           <div className="grid gap-1">
              {user.roles.includes('ADMIN') && (
                <Link 
                  href="/dashboard/admin" 
                  onClick={() => setActiveRole('ADMIN')}
                  className={`flex items-center justify-between px-4 py-2 rounded-xl text-sm font-black transition-all group ${user.activeRole === 'ADMIN' ? 'bg-[#08D6A6] text-white shadow-lg' : 'text-[#08D6A6] hover:bg-[#08D6A6]/5'}`}
                >
                   Admin Panel {user.activeRole === 'ADMIN' && <ChevronRight size={14} />}
                </Link>
              )}
              {user.roles.includes('VENDOR') && (
                <Link 
                  href="/dashboard/vendor" 
                  onClick={() => setActiveRole('VENDOR')}
                  className={`flex items-center justify-between px-4 py-2 rounded-xl text-sm font-black transition-all group ${user.activeRole === 'VENDOR' ? 'bg-[#FF7A00] text-white shadow-lg' : 'text-[#FF7A00] hover:bg-orange-50'}`}
                >
                   Vendor Hub {user.activeRole === 'VENDOR' && <ChevronRight size={14} />}
                </Link>
              )}
           </div>
        </div>
      )}

      {isAuthenticated && (
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gray-50 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 border-t border-gray-100 transition-all"
        >
          <LogOut size={16} /> Sign Out
        </button>
      )}
    </div>
  );
}
