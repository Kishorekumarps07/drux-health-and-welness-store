"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Store, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2,
  Zap,
  Eye,
  EyeOff,
  ShieldCheck,
  Truck,
  LineChart
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const PERKS = [
  { icon: Zap, label: "Instant store generation", desc: "Start listing in seconds." },
  { icon: Truck, label: "Logistics Support", desc: "Nationwide shipping integration." },
  { icon: LineChart, label: "Real-time Analytics", desc: "Track sales and user behavior." },
  { icon: ShieldCheck, label: "Verified Status", desc: "Build trust with Druxx badges." },
];

export default function VendorRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    storeName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Try to Sign Up via Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: "VENDOR"
          }
        }
      });

      // Handle "Email already taken" (422)
      if (authError) {
        if (authError.status === 422) {
          // If already exists, try to sign in with the provided password
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          });
          if (loginError) throw new Error("An account with this email already exists with a different password.");
        } else {
          throw authError;
        }
      }

      // 2. Call our Node.js Backend to initialize the Vendor Profile
      // We import api dynamically or use it from @/lib/api
      const { default: api } = await import("@/lib/api");
      await api.post('/vendor/onboard', {
        storeName: formData.storeName
      });

      toast.success("Merchant application submitted!");
      router.push("/vendor/status");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── Left Panel: Dark Brand ───────────────────────────── */}
      <div className="hidden lg:flex w-[52%] bg-[#0C0C0C] flex-col justify-between p-14 relative overflow-hidden border-r border-white/5">
        
        {/* Grid texture overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(166,214,8,1) 1px, transparent 1px), linear-gradient(90deg, rgba(166,214,8,1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }}
        />

        {/* Glow blobs */}
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #A6D608 0%, transparent 70%)" }}
        />
        <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #A6D608 0%, transparent 70%)" }}
        />

        {/* Logo removed as requested for consistency */}
        <div className="relative z-10" />

        {/* Content */}
        <div className="relative z-10 space-y-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#A6D608]/20 bg-[#A6D608]/5">
            <Zap size={14} className="text-[#A6D608]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608]">Vendor Enrollment</span>
          </div>

          <h1 className="text-6xl font-black text-white leading-[1] tracking-tight">
            Launch your<br />
            <span className="text-[#A6D608]">Wellness Brand.</span>
          </h1>

          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            Join the elite circle of health brands. Scale your reach with Druxx's premium distribution and tools.
          </p>

          {/* Perks list */}
          <div className="grid grid-cols-2 gap-8 pt-4">
            {PERKS.map((perk, i) => (
              <div key={i} className="space-y-2 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#A6D608] group-hover:scale-110 transition-transform">
                  <perk.icon size={20} />
                </div>
                <div>
                  <h4 className="text-white text-[11px] font-black uppercase tracking-wider">{perk.label}</h4>
                  <p className="text-gray-600 text-[10px] font-medium leading-tight">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-gray-700 text-[10px] font-bold uppercase tracking-widest">
            Trusted by 500+ Indian Wellness Brands
          </p>
        </div>
      </div>

      {/* ── Right Panel: Registration Form ───────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F9F9F6] p-8 overflow-y-auto py-20">

        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              Merchant Application
            </h2>
            <p className="text-gray-400 text-sm font-medium">
              Start your journey with Druxx Health Store.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Store Name - Highlighted */}
            <div className="p-6 bg-white rounded-3xl border-2 border-[#A6D608] shadow-xl shadow-[#A6D608]/5 mb-8 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-focus-within:opacity-30 transition-opacity">
                 <Store size={40} className="text-[#A6D608]" />
              </div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A6D608] block mb-2">
                Brand / Store Identity
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={e => setFormData({...formData, storeName: e.target.value})}
                placeholder="e.g. Pure Life Supplements"
                required
                className="w-full bg-transparent text-lg font-black text-gray-900 placeholder:text-gray-200 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Name</label>
                <div className="relative group">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A6D608] transition-colors" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    placeholder="John Doe"
                    required
                    className="w-full pl-11 pr-4 h-14 rounded-2xl bg-white border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#A6D608] focus:ring-4 focus:ring-[#A6D608]/10 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Business Email</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A6D608] transition-colors" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="you@brand.com"
                    required
                    className="w-full pl-11 pr-4 h-14 rounded-2xl bg-white border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#A6D608] focus:ring-4 focus:ring-[#A6D608]/10 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Secure Password</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A6D608] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••••"
                    required
                    className="w-full pl-11 pr-12 h-14 rounded-2xl bg-white border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#A6D608] focus:ring-4 focus:ring-[#A6D608]/10 transition-all"
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-[#0C0C0C] text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-[#1a1a1a] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-4 shadow-xl shadow-black/10"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight size={18} className="text-[#A6D608]" />
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-10 text-center space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Already have an account? <Link href="/vendor/login" className="text-[#A6D608] hover:underline ml-1">Sign In</Link>
            </p>
            <div className="flex items-center justify-center gap-6">
              <Link href="#" className="text-[9px] font-bold text-gray-300 uppercase hover:text-gray-500 transition-colors">Privacy Policy</Link>
              <span className="w-1 h-1 rounded-full bg-gray-200" />
              <Link href="#" className="text-[9px] font-bold text-gray-300 uppercase hover:text-gray-500 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
