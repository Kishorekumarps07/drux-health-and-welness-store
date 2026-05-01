"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthPortal } from "@/components/auth/AuthPortal";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[#A6D608]/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#2CA7A0]/5 blur-3xl animate-pulse" />
      </div>

      {/* Back Button */}
      <div className="absolute top-8 left-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-[#1E1E1E] transition-all group uppercase tracking-widest"
        >
          <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
          Store
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center">
              <span className="text-[#A6D608] font-black text-xl">D</span>
            </div>
            <span className="text-2xl font-black text-[#1E1E1E] tracking-tighter uppercase">Druxx</span>
          </Link>
        </div>

        <AuthPortal />
      </div>

      {/* Footer Links */}
      <div className="mt-12 flex items-center gap-8 opacity-40">
        <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Terms</Link>
        <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Privacy</Link>
        <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Support</Link>
      </div>
    </div>
  );
}
