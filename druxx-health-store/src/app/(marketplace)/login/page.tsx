"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CustomerLoginPage() {
  const router = useRouter();
  
  // Guard: if already logged in as a CUSTOMER, redirect to "/" (or redirect param)
  useAuthRedirect("CUSTOMER");

  const { login, register, sendOtp, verifyOtp, loginWithGoogle, mismatchError, clearMismatchError } = useAuthStore();

  const [mode, setMode] = useState<"login" | "signup" | "otp">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    otpCode: "",
  });

  useEffect(() => {
    clearMismatchError();
    setError("");
  }, [clearMismatchError]);

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    clearMismatchError();

    try {
      if (mode === "signup") {
        await register(formData.fullName, formData.email, formData.password, "CUSTOMER");
        toast.success("Welcome! Check your email to confirm registration.");
        setMode("login");
      } else {
        await login(formData.email, formData.password, "CUSTOMER");
        toast.success("Logged in successfully!");
        router.push("/");
      }
    } catch (error: any) {
      if (error.message !== "Role mismatch") {
        setError(error.message || "Authentication failed");
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    clearMismatchError();
    try {
      // For customers, allow account creation on OTP signup
      await sendOtp(formData.email, true);
      setOtpSent(true);
      toast.success("6-digit verification code sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otpCode) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    setError("");
    clearMismatchError();
    try {
      await verifyOtp(formData.email, formData.otpCode, "CUSTOMER");
      toast.success("Logged in successfully via OTP!");
      router.push("/");
    } catch (error: any) {
      if (error.message !== "Role mismatch") {
        setError(error.message || "Invalid or expired OTP code.");
        toast.error(error.message || "Invalid or expired OTP code.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    clearMismatchError();
    try {
      await loginWithGoogle("CUSTOMER");
    } catch (error: any) {
      toast.error(error.message || "Google authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-emerald-50/40 via-white to-lime-50/30 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Wellness Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[45%] h-[45%] rounded-full bg-[#A6D608]/8 blur-3xl animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[45%] h-[45%] rounded-full bg-[#2CA7A0]/8 blur-3xl animate-pulse" />
      </div>

      {/* Back to Store */}
      <div className="absolute top-8 left-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-gray-900 transition-all group uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          Store
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="w-full bg-white border border-gray-100/80 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-gray-200/40 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image 
                src="/druxlogo.png"
                alt="Drux Logo"
                width={162}
                height={108}
                className="h-24 w-auto object-contain"
                priority
              />
            </div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
              {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Secure OTP Access"}
            </h2>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              {mode === "login" ? "Enter your details to access your health hub." : 
               mode === "signup" ? "Join the Druxx health community today." : 
               "Direct login without passwords, verified via email."}
            </p>
          </div>

          {/* Role Mismatch or General Error Card */}
          {(error || mismatchError) && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center animate-in fade-in duration-300">
              <p className="text-xs font-bold text-rose-600 mb-3">
                {mismatchError?.message || error}
              </p>
              {mismatchError && (
                <Link 
                  href={mismatchError.link} 
                  className="inline-flex items-center justify-center px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-rose-700 transition-colors"
                >
                  {mismatchError.cta}
                </Link>
              )}
            </div>
          )}

          {/* OTP Mode Form */}
          {mode === "otp" ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    required
                    disabled={otpSent || loading}
                    type="email"
                    placeholder="name@example.com"
                    className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {otpSent && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between px-1">
                    <span>Verification Code</span>
                    <button 
                      type="button" 
                      onClick={handleSendOtp} 
                      className="text-[#A6D608] hover:underline normal-case font-bold"
                    >
                      Resend Code
                    </button>
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      required
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold tracking-[0.2em] text-center"
                      value={formData.otpCode}
                      onChange={(e) => setFormData({ ...formData, otpCode: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {!otpSent ? (
                <Button 
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-gray-900 text-white hover:bg-black font-black uppercase tracking-widest text-xs gap-2 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Send Verification Code"}
                </Button>
              ) : (
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-gray-900 text-white hover:bg-black font-black uppercase tracking-widest text-xs gap-2 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Verify & Sign In"}
                </Button>
              )}
            </form>
          ) : (
            /* Password Mode Form */
            <form onSubmit={handlePasswordAuth} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      required
                      type="text"
                      placeholder="John Doe"
                      className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    required
                    type="email"
                    placeholder="name@example.com"
                    className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-12 pr-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-bold"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-gray-900 text-white hover:bg-black font-black uppercase tracking-widest text-xs gap-2 transition-all group"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {mode === "login" ? "Sign In" : "Register"}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Social Sign In Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-gray-100" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Or continue with</span>
            <div className="flex-1 h-[1px] bg-gray-100" />
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full h-14 rounded-2xl border-gray-100 hover:bg-gray-50 font-black uppercase tracking-widest text-xs gap-2 transition-all text-gray-700"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Google
              </>
            )}
          </Button>

          {/* Toggle Modes */}
          <div className="mt-8 text-center pt-6 border-t border-gray-50 flex flex-col gap-3">
            <p className="text-xs text-gray-500 font-medium">
              {mode === "login" ? "Don't have an account?" : mode === "signup" ? "Already have an account?" : "Need a password?"}{" "}
              <button 
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setOtpSent(false);
                }}
                className="text-[#A6D608] font-black uppercase tracking-wider hover:underline"
              >
                {mode === "login" ? "Sign Up Free" : "Log In"}
              </button>
            </p>

            <button 
              onClick={() => {
                setMode(mode === "otp" ? "login" : "otp");
                setOtpSent(false);
              }}
              className="text-xs font-black uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors"
            >
              {mode === "otp" ? "Use Password Instead" : "Sign In with Email OTP"}
            </button>
          </div>
        </div>
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
