"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  TrendingUp, 
  ShoppingBag, 
  Star,
  Loader2,
  KeyRound,
  ShieldCheck
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const STATS = [
  { icon: TrendingUp, value: "₹2.4Cr+", label: "Vendor Payouts" },
  { icon: ShoppingBag, value: "18K+", label: "Orders Fulfilled" },
  { icon: Star, value: "4.8★", label: "Avg. Store Rating" },
];

export default function VendorLoginPage() {
  const router = useRouter();
  
  // Guard: if already logged in as a VENDOR, redirect to "/dashboard/vendor"
  useAuthRedirect("VENDOR");

  const { login, sendOtp, verifyOtp, loginWithGoogle, mismatchError, clearMismatchError } = useAuthStore();

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    clearMismatchError();
    setError("");
  }, [clearMismatchError]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    clearMismatchError();
    try {
      await login(email, password, "VENDOR");
      toast.success("Merchant session authorized.");
      router.push("/dashboard/vendor");
    } catch (err: any) {
      if (err?.message !== "Role mismatch") {
        setError("Invalid email or password.");
        toast.error("Invalid email or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your business email.");
      return;
    }
    setIsLoading(true);
    setError("");
    clearMismatchError();
    try {
      // Don't allow user creation (prevent fake/unregistered merchant accounts)
      await sendOtp(email, false);
      setOtpSent(true);
      toast.success("Verification code sent to your business email.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send verification code. Ensure your email is registered.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error("Please enter the verification code.");
      return;
    }
    setIsLoading(true);
    setError("");
    clearMismatchError();
    try {
      await verifyOtp(email, otpCode, "VENDOR");
      toast.success("Merchant session authorized via OTP.");
      router.push("/dashboard/vendor");
    } catch (err: any) {
      if (err?.message !== "Role mismatch") {
        setError(err.message || "Invalid or expired OTP.");
        toast.error(err.message || "Invalid or expired OTP.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    clearMismatchError();
    try {
      await loginWithGoogle("VENDOR");
    } catch (err: any) {
      toast.error(err.message || "Google authentication failed");
      setIsLoading(false);
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

        {/* Glow blobs */}
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full opacity-20 bg-lime-500 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full opacity-10 bg-emerald-500 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <span className="text-[#A6D608] font-black text-xl">D</span>
            </div>
            <span className="text-xl font-black text-white tracking-tighter uppercase">Druxx</span>
          </Link>
        </div>

        {/* Main Copy */}
        <div className="relative z-10 space-y-8 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime-500/20 bg-lime-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A6D608]">Merchant Portal</span>
          </div>

          <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
            Scale your wellness brand.<br />
            <span className="text-[#A6D608]">We handle the rest.</span>
          </h1>

          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            Access robust vendor analytics, list products, track orders, and payout earnings seamlessly.
          </p>

          {/* Stats Row */}
          <div className="flex gap-6 pt-4 border-t border-white/5">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Icon size={14} className="text-[#A6D608]" />
                  <span className="text-xl font-black text-white">{value}</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="relative z-10">
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Druxx Merchant · Verified Seller Network
          </p>
        </div>
      </div>

      {/* ── Right Panel: Login Form ────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md bg-white border border-gray-100/80 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-gray-200/30">

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 text-white mb-4">
              <ShoppingBag size={20} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2 uppercase">
              Merchant Login
            </h2>
            <p className="text-gray-400 text-xs font-medium">
              Access your verified seller account panel.
            </p>
          </div>

          {/* Role Mismatch or Custom Error */}
          {(error || mismatchError) && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
              <p className="text-xs font-bold text-rose-600">
                {mismatchError?.message || error}
              </p>
            </div>
          )}

          {mode === "password" ? (
            /* Password Login */
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
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

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Password
                  </label>
                  <Link 
                    href="/vendor/forgot-password" 
                    className="text-[10px] font-black text-[#A6D608] hover:text-[#8ab506] uppercase tracking-widest hover:underline transition-all"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    className="pl-11 pr-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white text-sm font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-zinc-950 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Access Dashboard"}
              </Button>
            </form>
          ) : (
            /* OTP Login */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                  Business Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                  <Input
                    type="email"
                    value={email}
                    disabled={otpSent || isLoading}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@yourbrand.com"
                    required
                    className="pl-11 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white text-sm font-bold"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                    Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    <Input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      placeholder="6-digit code"
                      required
                      className="pl-11 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white text-sm font-bold text-center tracking-[0.2em]"
                    />
                  </div>
                </div>
              )}

              {!otpSent ? (
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl bg-zinc-950 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Send Verification Code"}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl bg-zinc-950 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Verify & Sign In"}
                </Button>
              )}
            </form>
          )}

          {/* Social login divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Or Google Sign In</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full h-14 rounded-2xl border-gray-100 hover:bg-gray-50 text-zinc-700 text-xs font-black uppercase tracking-widest gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Google Portal Sign In
              </>
            )}
          </Button>

          {/* Toggle login methods */}
          <div className="mt-8 text-center pt-6 border-t border-gray-50 flex flex-col gap-2.5">
            <button 
              onClick={() => {
                setMode(mode === "password" ? "otp" : "password");
                setOtpSent(false);
              }}
              className="text-xs font-black uppercase tracking-wider text-lime-600 hover:text-lime-700 transition-colors"
            >
              {mode === "password" ? "Sign In with Email OTP" : "Sign In with Password"}
            </button>

            <Link href="/vendor/register" className="text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-zinc-600 transition-colors">
              New merchant? Apply for store page
            </Link>
          </div>

          {/* Back to store */}
          <div className="text-center mt-6">
            <Link href="/" className="text-[10px] font-black text-gray-400 hover:text-gray-700 uppercase tracking-widest transition-colors">
              ← Go back to main site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
