"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Store } from "lucide-react";

interface MinimalHeaderProps {
  type?: 'VENDOR' | 'ADMIN';
}

export function MinimalHeader({ type = 'VENDOR' }: MinimalHeaderProps) {
  return (
    <header className="w-full bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative w-32 h-10">
          <Image
            src="/logo.png"
            alt="Druxx Health"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="h-6 w-px bg-gray-200 mx-2" />
        <span className="font-black text-sm tracking-tighter text-gray-900 group-hover:text-[#A6D608] transition-colors uppercase italic shadow-sm bg-white border border-gray-100 px-2 py-0.5 rounded-lg">
          {type === 'VENDOR' ? 'biz' : 'ops'}
        </span>
      </Link>

      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
        {type === 'VENDOR' ? (
          <>
            <Store size={14} className="text-[#A6D608]" />
            <span className="hidden sm:inline">Merchant Ecosystem</span>
          </>
        ) : (
          <>
            <ShieldCheck size={14} className="text-[#08D6A6]" />
            <span className="hidden sm:inline">System Operations</span>
          </>
        )}
      </div>
    </header>
  );
}
