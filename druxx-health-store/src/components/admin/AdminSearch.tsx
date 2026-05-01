"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Users, 
  Store, 
  ShoppingBag, 
  ArrowRight, 
  X,
  Command,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AdminSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSearch({ isOpen, onClose }: AdminSearchProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Mock results for immediate interactivity
  const RESULTS = [
    { id: '1', category: 'Vendors', title: 'Organic Farm Co', subtitle: 'Pending Approval', link: '/dashboard/admin/vendors', icon: Store },
    { id: '2', category: 'Vendors', title: 'Wellness World', subtitle: 'Active', link: '/dashboard/admin/vendors', icon: Store },
    { id: '3', category: 'Orders', title: 'Order #DRX-8821', subtitle: '₹1,240 - Processing', link: '/dashboard/admin/orders', icon: ShoppingBag },
    { id: '4', category: 'Users', title: 'Alex Johnson', subtitle: 'alex.j@example.com', link: '/dashboard/admin/users', icon: Users },
  ];

  const filteredResults = query 
    ? RESULTS.filter(r => 
        r.title.toLowerCase().includes(query.toLowerCase()) || 
        r.category.toLowerCase().includes(query.toLowerCase())
      )
    : RESULTS.slice(0, 3); // Recent items placeholder

  const handleNavigate = (link: string) => {
    router.push(link);
    onClose();
    setQuery("");
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (isOpen) onClose();
    }
    if (e.key === "Escape") {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div className="relative w-full max-w-[640px] bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden animate-in slide-in-from-top-4 duration-300">
        <div className="flex items-center px-6 py-5 border-b border-[#1F2937]">
          <Search className="w-5 h-5 text-[#9CA3AF] mr-4" />
          <input 
            autoFocus
            type="text"
            placeholder="Search vendors, orders, users..."
            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-[#4B5563]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:flex h-6 items-center gap-1 rounded border border-[#1F2937] bg-[#0B0F14] px-1.5 font-mono text-[10px] font-bold text-[#9CA3AF] uppercase">
              Esc
            </kbd>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9CA3AF] hover:text-white" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-[480px] overflow-y-auto custom-scrollbar p-2">
          {query === "" && (
            <div className="px-4 py-3 flex items-center gap-2 text-[10px] font-bold text-[#4B5563] uppercase tracking-widest">
              <History size={12} /> Recent Searches
            </div>
          )}

          {filteredResults.length > 0 ? (
            <div className="grid gap-1">
              {filteredResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleNavigate(result.link)}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-[#1F2937] transition-all group text-left w-full"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#0B0F14] border border-[#1F2937] flex items-center justify-center text-[#9CA3AF] group-hover:text-[#10B981] group-hover:border-[#10B981]/30 transition-all">
                      <result.icon size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight">{result.title}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#10B981]/60 px-1.5 py-0.5 rounded-md bg-[#10B981]/5 border border-[#10B981]/10">
                          {result.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] font-medium mt-0.5">{result.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[#374151] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-[#4B5563]">
              <Command size={40} className="mb-4 opacity-20" />
              <p className="text-sm font-bold tracking-tight">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for different keywords</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#0B0F14] border-t border-[#1F2937] flex items-center gap-6">
           <div className="flex items-center gap-2 text-[10px] font-bold text-[#4B5563]">
              <span className="bg-[#1F2937] px-1.5 py-0.5 rounded border border-[#374151] text-white">ENTER</span>
              <span>to select</span>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-[#4B5563]">
              <span className="bg-[#1F2937] px-1.5 py-0.5 rounded border border-[#374151] text-white">↑↓</span>
              <span>to navigate</span>
           </div>
        </div>
      </div>
    </div>
  );
}
