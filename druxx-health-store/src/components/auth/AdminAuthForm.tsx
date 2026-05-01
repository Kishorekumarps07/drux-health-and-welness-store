"use client";

import { BaseAuthForm } from "./BaseAuthForm";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function AdminAuthForm() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2 mb-4">
         <div className="w-12 h-12 bg-[#171717] rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group border border-white/5">
            <ShieldCheck size={24} className="text-[#08D6A6] relative z-10" />
         </div>
         <div className="flex flex-col items-center gap-1 font-mono">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#08D6A6] animate-pulse" />
               <span className="text-[9px] font-black text-[#08D6A6] uppercase tracking-[0.2em]">System Operational</span>
            </div>
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Secure Session v1.4 // Port: 443</span>
         </div>
      </div>

      <BaseAuthForm {...({
        requiredRole: "ADMIN",
        showRegister: false,
        title: "Internal Access",
        subtitle: "",
        submitLabel: "Authorize Session",
        onSuccess: () => router.push('/dashboard/admin'),
        themeColor: "#262626"
      } as any)} />

      <div className="text-center font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-gray-600 space-y-1 mt-6">
         <p className="flex items-center justify-center gap-1.5">
            <Lock size={10} className="text-[#08D6A6]/50" />
            AES-256 Encrypted Protocol
         </p>
         <p>Verification Required // personnel only</p>
      </div>
    </div>
  );
}
