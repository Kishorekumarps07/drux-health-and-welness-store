"use client";

import Link from "next/link";
import { Shield, Mail, Phone } from "lucide-react";

export function MinimalFooter() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-8 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 italic">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">© {new Date().getFullYear()} Druxx Health Store</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-none">The Merchant Ecosystem Hub</p>
          </div>

          <div className="flex items-center gap-8">
              {[
                { label: "Merchant Help", href: "/help", icon: <Mail size={12} /> },
                { label: "Terms", href: "/terms", icon: <Shield size={12} /> },
                { label: "Support", href: "/contact", icon: <Phone size={12} /> },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#A6D608] transition-colors flex items-center gap-1.5 leading-none">
                  {item.icon} {item.label}
                </Link>
              ))}
          </div>

          <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Platform Status: Operational</span>
          </div>
      </div>
    </footer>
  );
}
