"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, TrendingUp, ShoppingBag, Star } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const STATS = [
  { icon: TrendingUp, value: "₹2.4Cr+", label: "Vendor Payouts" },
  { icon: ShoppingBag, value: "18K+", label: "Orders Fulfilled" },
  { icon: Star, value: "4.8★", label: "Avg. Store Rating" },
];

export default function VendorLoginPage() {
  const router = useRouter();
  const { login, mismatchError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(email, password, "VENDOR");
      router.push("/dashboard/vendor");
    } catch (err: any) {
      setError(err?.message?.includes("Role mismatch") ? "" : "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── Left Panel: Dark Brand ───────────────────────────── */}
      <div className="hidden lg:flex w-[52%] bg-[#0C0C0C] flex-col justify-between p-14 relative overflow-hidden">
        
        {/* Grid texture overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(166,214,8,1) 1px, transparent 1px), linear-gradient(90deg, rgba(166,214,8,1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }}
        />

        {/* Glow blob */}
        <div className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #A6D608 0%, transparent 70%)" }}
        />
        <div className="absolute bottom-[-100px] left-[-60px] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #A6D608 0%, transparent 70%)" }}
        />

        {/* Logo removed as requested */}
        <div className="relative z-10" />

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#A6D608]/20 bg-[#A6D608]/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608]">Merchant Portal</span>
          </div>

          <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
            Your store.<br />
            <span className="text-[#A6D608]">Your rules.</span><br />
            Your revenue.
          </h1>

          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            Join thousands of health & wellness brands selling on India's fastest-growing marketplace.
          </p>

          {/* Stats row */}
          <div className="flex gap-6 pt-2">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Icon size={12} className="text-[#A6D608]" />
                  <span className="text-xl font-black text-white">{value}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial card removed as requested */}
        </div>

        {/* Bottom copyright */}
        <div className="relative z-10">
          <p className="text-gray-700 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Druxx Health Store · All rights reserved
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-[#F9F9F6] p-8">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              Merchant Sign In
            </h2>
            <p className="text-gray-400 text-sm font-medium">
              Access your Druxx seller dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Business Email
              </label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A6D608] transition-colors pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@yourbrand.com"
                  required
                  className="w-full pl-11 pr-4 h-14 rounded-2xl bg-white border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-[#A6D608] focus:ring-4 focus:ring-[#A6D608]/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Password
                </label>
                <Link href="#" className="text-[10px] font-bold text-[#A6D608] hover:underline uppercase tracking-widest">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A6D608] transition-colors pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="w-full pl-11 pr-12 h-14 rounded-2xl bg-white border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-[#A6D608] focus:ring-4 focus:ring-[#A6D608]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error messages */}
            {(error || mismatchError) && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p className="text-red-600 text-xs font-bold">
                  {mismatchError?.message || error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-[#0C0C0C] text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-[#1a1a1a] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-xl shadow-black/10"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">New Seller?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register CTA */}
          <Link
            href="/vendor/register"
            className="w-full h-14 rounded-2xl border-2 border-[#A6D608] bg-[#A6D608]/5 text-gray-900 font-black text-sm flex items-center justify-center gap-2 hover:bg-[#A6D608] hover:text-black transition-all group"
          >
            Apply as a Vendor
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Back to store */}
          <div className="text-center mt-8">
            <Link href="/" className="text-[10px] font-bold text-gray-400 hover:text-gray-700 uppercase tracking-widest transition-colors">
              ← Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
