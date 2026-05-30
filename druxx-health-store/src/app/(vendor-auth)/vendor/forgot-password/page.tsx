"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  TrendingUp, 
  ShoppingBag, 
  Star,
  Loader2,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const STATS = [
  { icon: TrendingUp, value: "₹2.4Cr+", label: "Vendor Payouts" },
  { icon: ShoppingBag, value: "18K+", label: "Orders Fulfilled" },
  { icon: Star, value: "4.8★", label: "Avg. Store Rating" },
];

export default function VendorForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your business email.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Recovery link sent to your business email.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send recovery link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#FAFBF8]">
      
      {/* ── Left Panel: Dark Brand ───────────────────────────── */}
      <div className="hidden lg:flex w-[50%] bg-zinc-950 flex-col justify-between p-14 relative overflow-hidden">
        
        {/* Grid texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(166,214,8,1) 1px, transparent 1px), linear-gradient(90deg, rgba(166,214,8,1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }}
        />

        {/* Back Link */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 text-xs font-black tracking-widest text-[#A6D608] hover:text-[#8ab506] transition-all uppercase">
            <span className="text-sm">←</span> drux store
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 max-w-lg space-y-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608] bg-[#A6D608]/10 px-4 py-2 rounded-full">
            drux merchant network
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-none">
            Secure your <br />
            <span className="text-[#A6D608]">merchant</span> portal.
          </h2>
          <p className="text-zinc-400 text-base font-medium leading-relaxed">
            Verify your business identity to reset your portal password. Enter your registered business email and we will dispatch a secure, single-use authentication recovery link.
          </p>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-3 gap-8 relative z-10 border-t border-zinc-900 pt-10">
          {STATS.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2">
                <s.icon className="w-4 h-4 text-[#A6D608]" />
                <span className="text-lg font-black text-white">{s.value}</span>
              </div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel: Form ───────────────────────────── */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-12 relative">
        <div className="w-full max-w-[420px] mx-auto space-y-8">
          
          <div className="space-y-2.5">
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">
              Merchant Recovery
            </h1>
            <p className="text-zinc-500 text-sm font-medium">
              Enter your registered business email to recover your access
            </p>
          </div>

          {success ? (
            <div className="bg-[#FAFBF8] border border-zinc-100 rounded-3xl p-8 text-center space-y-6 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-zinc-950">Email Dispatched</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  A secure, single-use password reset link was sent to <span className="font-semibold text-zinc-800">{email}</span>. Click the link in your inbox within 1 hour to set a new password.
                </p>
              </div>
              <div className="pt-2">
                <Link 
                  href="/vendor/login" 
                  className="w-full h-12 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center"
                >
                  Back to Portal Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                  Business Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@yourbrand.com"
                    required
                    className="pl-11 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white text-sm font-bold"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-zinc-950 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Send Password Link"}
              </Button>

              <div className="text-center pt-2">
                <Link href="/vendor/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 font-black uppercase tracking-wider hover:text-zinc-950 transition-colors">
                  <ArrowLeft size={12} /> Back to Login
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
      
    </div>
  );
}
