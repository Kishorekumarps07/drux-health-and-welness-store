"use client";

import { BaseAuthForm } from "./BaseAuthForm";
import { useRouter } from "next/navigation";
import { ShoppingBag, ShieldCheck, Heart, Lock, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CustomerAuthForm({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const router = useRouter();

  return (
    <div className="space-y-12">
      <BaseAuthForm 
        logo={true}
        mode={mode}
        subtitle="Your sanctuary for premium wellness starts here."
        onSuccess={(user) => {
          if (user.roles.includes('ADMIN')) router.push('/dashboard/admin');
          else if (user.roles.includes('VENDOR')) router.push('/dashboard/vendor');
          else router.push('/');
        }}
      />
      
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-6 w-full">
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500/80 italic">Verified Safety Protocol</p>
           <div className="flex items-center justify-between w-full px-4">
              <div className="flex flex-col items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-[#A6D608]/10 flex items-center justify-center text-[#A6D608] shadow-[0_8px_20px_-4px_rgba(166,214,8,0.2)]">
                    <Lock size={20} />
                 </div>
                 <span className="text-[7.5px] font-black uppercase tracking-widest text-gray-600">SSL Encryption</span>
              </div>
              <div className="w-px h-12 bg-gray-200/50" />
              <div className="flex flex-col items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-400 shadow-[0_8px_20px_-4px_rgba(96,165,250,0.2)]">
                    <Shield size={20} />
                 </div>
                 <span className="text-[7.5px] font-black uppercase tracking-widest text-gray-600">Data Privacy</span>
              </div>
              <div className="w-px h-12 bg-gray-200/50" />
              <div className="flex flex-col items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-400 shadow-[0_8px_20px_-4px_rgba(248,113,113,0.2)]">
                    <Heart size={20} />
                 </div>
                 <span className="text-[7.5px] font-black uppercase tracking-widest text-gray-600">Care Commitment</span>
              </div>
           </div>
        </div>

        <Link href="/products" className="group flex items-center gap-3 text-[10px] font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-widest italic pt-4 border-t border-gray-100 w-full justify-center">
          Continue as guest 
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
