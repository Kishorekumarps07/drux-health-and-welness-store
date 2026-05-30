"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { toast } from "sonner";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck, 
  Terminal, 
  KeyRound, 
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();

  // Guard: if already logged in as ADMIN, redirect to "/dashboard/admin"
  useAuthRedirect("ADMIN");

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
      await login(email, password, "ADMIN");
      toast.success("Administrator session authorized.");
      router.push("/dashboard/admin");
    } catch (err: any) {
      if (err?.message !== "Role mismatch") {
        setError("Authorization failed. Verify credentials.");
        toast.error("Invalid credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter administrator email.");
      return;
    }
    setIsLoading(true);
    setError("");
    clearMismatchError();
    try {
      // Don't allow user creation (prevent fake/unregistered admin accounts)
      await sendOtp(email, false);
      setOtpSent(true);
      toast.success("Security token sent to administrator email.");
    } catch (err: any) {
      toast.error(err.message || "Security token request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error("Please enter the security token.");
      return;
    }
    setIsLoading(true);
    setError("");
    clearMismatchError();
    try {
      await verifyOtp(email, otpCode, "ADMIN");
      toast.success("Administrator session authorized via OTP.");
      router.push("/dashboard/admin");
    } catch (err: any) {
      if (err?.message !== "Role mismatch") {
        setError(err.message || "Invalid or expired security token.");
        toast.error(err.message || "Invalid or expired security token.");
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
      await loginWithGoogle("ADMIN");
    } catch (err: any) {
      toast.error(err.message || "OAuth validation failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Scanline Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(8, 214, 166, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(8, 214, 166, 1) 1px, transparent 1px)`,
          backgroundSize: "32px 32px"
        }}
      />

      {/* Terminal Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#08D6A6]/5 rounded-full blur-[140px] -z-10" />
      <div className="absolute -top-[10%] left-[10%] w-[350px] h-[350px] bg-emerald-950/20 rounded-full blur-[100px] -z-10" />

      {/* Back to main site link */}
      <div className="absolute top-8 left-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-[#08D6A6] transition-all group uppercase tracking-[0.2em]"
        >
          <ArrowLeft size={12} className="transform group-hover:-translate-x-1 transition-transform" />
          Terminate Node
        </Link>
      </div>

      <div className="w-full max-w-[26rem] z-10">
        
        {/* Connection Status Badge */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-24 mb-4 flex items-center justify-center relative overflow-hidden">
            <img 
              src="/druxlogo.png" 
              alt="Drux Logo" 
              className="h-full object-contain brightness-0 invert"
            />
          </div>
          <div className="flex flex-col items-center gap-1 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#08D6A6] animate-pulse" />
              <span className="text-[9px] font-black text-[#08D6A6] uppercase tracking-[0.2em]">SYS_ADMIN_LOCK v2.0</span>
            </div>
            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Access Point // Secure Verification</span>
          </div>
        </div>

        {/* Cryptographic Card Wrapper */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-black/80">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#fafafa] uppercase tracking-tighter">
              {mode === "password" ? "Credentials Required" : "Security Token Required"}
            </h2>
            <p className="text-[10px] text-zinc-500 mt-2 font-mono uppercase tracking-wider">
              {mode === "password" ? "Enter system password to authorize login session." : 
               "Direct authorization key verified via email verification."}
            </p>
          </div>

          {/* Role Mismatch Error or System Error */}
          {(error || mismatchError) && (
            <div className="mb-6 p-4 bg-red-950/20 border border-red-900/30 rounded-2xl text-center">
              <p className="text-xs font-mono font-bold text-red-400">
                {mismatchError?.message || error}
              </p>
            </div>
          )}

          {mode === "password" ? (
            /* Password Login */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 font-mono px-1">
                  Operator Username
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <Input
                    required
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sysadmin@druxx.com"
                    className="pl-11 h-14 rounded-2xl border-zinc-800/80 bg-zinc-900/50 focus:bg-zinc-900 focus:border-[#08D6A6]/40 focus:ring-1 focus:ring-[#08D6A6]/20 transition-all text-sm font-medium text-zinc-100 placeholder-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 font-mono">
                    System Password
                  </label>
                  <Link 
                    href="/admin/forgot-password" 
                    className="text-[9px] font-black text-[#08D6A6] hover:text-[#06b88e] uppercase tracking-widest hover:underline transition-all font-mono"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <Input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="current-password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-11 pr-12 h-14 rounded-2xl border-zinc-800/80 bg-zinc-900/50 focus:bg-zinc-900 focus:border-[#08D6A6]/40 focus:ring-1 focus:ring-[#08D6A6]/20 transition-all text-sm font-medium text-zinc-100 placeholder-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-[#08D6A6] hover:bg-[#06b88e] text-zinc-950 font-black text-xs uppercase tracking-[0.2em] transition-all relative overflow-hidden group shadow-lg shadow-[#08D6A6]/10"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    Authorize Node <ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            /* OTP Verification Login */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 font-mono px-1">
                  Operator Username
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <Input
                    required
                    type="email"
                    disabled={otpSent || isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sysadmin@druxx.com"
                    className="pl-11 h-14 rounded-2xl border-zinc-800/80 bg-zinc-900/50 focus:bg-zinc-900 focus:border-[#08D6A6]/40 focus:ring-1 focus:ring-[#08D6A6]/20 transition-all text-sm font-medium text-zinc-100 placeholder-zinc-700"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 font-mono px-1">
                    Security Token (6-Digit)
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <Input
                      required
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="XXXXXX"
                      className="pl-11 h-14 rounded-2xl border-zinc-800/80 bg-zinc-900/50 focus:bg-zinc-900 focus:border-[#08D6A6]/40 focus:ring-1 focus:ring-[#08D6A6]/20 transition-all text-sm font-medium text-zinc-100 text-center tracking-[0.25em] placeholder-zinc-700"
                    />
                  </div>
                </div>
              )}

              {!otpSent ? (
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-700 font-black text-xs uppercase tracking-[0.2em] transition-all"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Request Token"}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl bg-[#08D6A6] hover:bg-[#06b88e] text-zinc-950 font-black text-xs uppercase tracking-[0.2em] transition-all"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Verify Session"}
                </Button>
              )}
            </form>
          )}

          {/* Cryptographic Key Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-zinc-900" />
            <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-600">Or Federated Identity</span>
            <div className="flex-1 h-[1px] bg-zinc-900" />
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full h-14 rounded-2xl border-zinc-800/80 bg-zinc-900/20 hover:bg-zinc-900 text-zinc-300 hover:text-white font-black text-xs uppercase tracking-[0.2em] gap-2 transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : (
              <>
                <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" opacity="0.8"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="currentColor" opacity="0.6"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="currentColor" opacity="0.9"/>
                </svg>
                Validate SSO
              </>
            )}
          </Button>

          {/* Toggle modes */}
          <div className="mt-8 text-center pt-6 border-t border-zinc-900 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMode(mode === "password" ? "otp" : "password");
                setOtpSent(false);
              }}
              className="text-[10px] font-mono uppercase tracking-widest text-[#08D6A6] hover:underline"
            >
              {mode === "password" ? "[ Switch to OTP Verification ]" : "[ Switch to password auth ]"}
            </button>
          </div>
        </div>

        {/* Cryptographic Encryption Footer */}
        <div className="text-center font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600 space-y-1 mt-6">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck size={10} className="text-[#08D6A6]/50" />
            AES-256 System Encryption Protocol
          </p>
          <p>Authorized personnel only. Sessions are logged.</p>
        </div>
      </div>
    </div>
  );
}
