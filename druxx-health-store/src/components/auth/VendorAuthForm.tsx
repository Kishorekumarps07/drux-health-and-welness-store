"use client";

import { BaseAuthForm } from "./BaseAuthForm";
import { useRouter } from "next/navigation";
import { Store, Zap, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function VendorAuthForm() {
  const router = useRouter();

  return (
    <div className="space-y-10">
      <BaseAuthForm {...({
        requiredRole: "VENDOR",
        showRegister: false,
        title: "Start selling on Druxx",
        subtitle: "Manage your business with India's premium wellness tools.",
        submitLabel: "Access Merchant Dashboard",
        onSuccess: () => router.push('/dashboard/vendor'),
        themeColor: "#1E1E1E"
      } as any)} />
      
      <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm italic space-y-6 bg-gradient-to-br from-white to-gray-50/50">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-[#A6D608]/10 flex items-center justify-center text-[#A6D608] shadow-sm">
              <Zap size={22} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 leading-none mb-1.5">New around here?</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">Grow your brand with Druxx Health.</p>
           </div>
        </div>
        <Link href="/vendor/register" className="flex items-center justify-between p-5 bg-gray-900 rounded-2xl border border-transparent hover:border-[#A6D608]/50 hover:shadow-xl hover:shadow-[#A6D608]/10 transition-all group">
           <span className="text-xs font-black text-white uppercase tracking-widest italic font-bold">Register as Vendor</span>
           <ChevronRight size={16} className="text-[#A6D608] transform group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
