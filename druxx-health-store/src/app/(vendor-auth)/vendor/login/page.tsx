"use client";

import { VendorAuthForm } from "@/components/auth/VendorAuthForm";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export default function VendorLoginPage() {
  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
      {/* Left Column: Branding & Value Prop */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-white via-white to-[#A6D608]/10 relative overflow-hidden p-20 flex-col justify-center border-r border-gray-100">
        <div className="relative z-10 max-w-xl">
           <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-[#A6D608]/10 rounded-full border border-[#A6D608]/20">
              <div className="w-2 h-2 rounded-full bg-[#A6D608] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">Merchant Launchpad</span>
           </div>
           
           <h1 className="text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter mb-8 italic">
              Grow your business <br /> 
              <span className="text-gray-400">with </span>
              <span className="text-[#A6D608]">Druxx.</span>
           </h1>

           <div className="space-y-6 mb-16">
              {[
                "Manage inventory with India's smart tools.",
                "Track sales and analytics in real-time.",
                "Reach 10M+ health & wellness shoppers."
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 group">
                   <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[#A6D608] border border-gray-100 group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={14} />
                   </div>
                   <p className="text-sm font-bold text-gray-500 italic uppercase tracking-wider">{text}</p>
                </div>
              ))}
           </div>

           <div className="relative w-full aspect-square max-w-md mx-auto animate-float">
              <Image 
                src="/merchant-saas-illustration.png"
                alt="Grow your business"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
           </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#A6D608]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-50/30 rounded-full blur-3xl" />
      </div>

      {/* Right Column: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/30">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-1000 delay-200">
           <div className="lg:hidden flex justify-center mb-12">
              <div className="relative w-40 h-12">
                 <Image src="/logo.png" alt="Druxx" fill className="object-contain" />
              </div>
           </div>
           <VendorAuthForm />
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
